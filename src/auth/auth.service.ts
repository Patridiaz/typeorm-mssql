import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcryptjs from 'bcryptjs'
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from './interfaces/jwt-payload';
import { RecoveryToken } from './entity/recovery-token.entity';
import { MailService } from './mail.service';
import { config } from 'dotenv';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';
import { UpdateUserDto } from './dto/update-user.dto';

config(); // Cargar variables de entorno

@Injectable()
export class AuthService {

    private readonly BaseUrl: string;

    constructor(

        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        @InjectRepository(RecoveryToken)
        private recoveryTokenRepository: Repository<RecoveryToken>,
        private mailService: MailService,
        @InjectRepository(Establecimiento)
        private establecimientoRepository: Repository<Establecimiento>

    ){
        this.BaseUrl = process.env.BASE_URL ;
    }
    // Logica de crear usuario comienza aqui

    async createUser(createUserDto: CreateUserDto): Promise<User> {
      try {
        const { password, establecimiento, ...userData } = createUserDto;
    
        // Verificar si el correo ya está en uso
        const existingUser = await this.userRepository.findOne({
          where: {
            email: userData.email,
          },
        });
    
        if (existingUser) {
          throw new BadRequestException('El correo electrónico ya está en uso.');
        }
    
        // Encriptar la contraseña
        const hashedPassword = bcryptjs.hashSync(password, 10);
        
        let est = null;
    
        if (establecimiento) {
          est = await this.establecimientoRepository.findOne({
            where: {
              id: establecimiento,
            },
          });
    
          if (!est) {
            throw new BadRequestException('Establecimiento no encontrado');
          }
        }
    
        // Crear el nuevo usuario
        const newUser = this.userRepository.create({
          ...userData,
          password: hashedPassword,
          establecimiento: est,
        });
    
        // Guardar el nuevo usuario
        await this.userRepository.save(newUser);
    
        // // Enviar el correo de bienvenida
        // await this.mailService.sendWelcomeEmail(newUser.email, newUser.name);
    
        // Retornar el usuario como una instancia de User
        return plainToInstance(User, newUser);
      } catch (error) {
        if (error.code === '11000') {
          throw new BadRequestException(`${createUserDto.email} ya existe!`);
        }
        throw new InternalServerErrorException('Algo terrible sucedió!');
      }
    }
    
    
      
    async login( loginDto: LoginDto) {

        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { email: email } });
        if ( !user ) {
            throw new UnauthorizedException('Credenciales de acceso invalidas -email');
        }

        if ( !bcryptjs.compareSync( password, user.password )){
            throw new UnauthorizedException('Credenciales de acceso invalidas - password');
        }

        const { password: _, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            token: this.getJwtToken( user )
        }
    }



    findAll(): Promise<User[]> {
        return this.userRepository.find()
    }

  async findUserById ( id: number ): Promise<User> {
      const user = await this.userRepository.findOne({ 
          where: { id },
          // ✅ Asegurar que la relación 'roles' se cargue para el JWT.
          // Si tienes { eager: true } en la entidad User, esto es opcional.
          relations: ['roles'] 
      }); 

      if (!user) {
          throw new UnauthorizedException(`Usuario con ID ${id} no encontrado`);
      }

      // Retorna el objeto User completo
      return user;
  }
    


    async findOne(id: number): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'name'] // Selecciona solo los campos necesarios, excluyendo la contraseña si se usa
      });
      
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
    
      return user;
    }


    // Actualizar un usuario
    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        // Verifica si el usuario existe
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        // Si se proporciona una nueva contraseña, encripta la contraseña
        if (updateUserDto.password) {
            updateUserDto.password = bcryptjs.hashSync(updateUserDto.password, 10);
        }

        // Actualiza el usuario con los datos del DTO
        await this.userRepository.update(id, updateUserDto);
        return this.findOne(id);
    }

    // remove(id: number) {
    //     return 'This action remove a #${id} auth'
    // }
    
  getJwtToken(user: User) {
      // Extrae solo los nombres de los roles (ej: ['admin', 'COMPRADOR'])
      const userRoleNames = user.roles.map(rol => rol.nombre); 

      const payload = {
          sub: user.id,
          email: user.email,
          roles: userRoleNames, // Incluye el array de nombres de roles en el payload
          sourceDb: 'BD_Tickets',
      };

      // Esto firma el JWT con los datos actualizados, incluyendo el array de roles.
      return this.jwtService.sign(payload);
  }

  // Nueva funcionalidad para recuperación de contraseña
  async requestPasswordReset(email: string): Promise<void> {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
          throw new NotFoundException('Usuario no encontrado');
      }

      // Generar un token de recuperación
      const resetToken = bcryptjs.hashSync(user.email + Date.now().toString(), 10); // Simple hash token
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Expira en 1 hora

      // Guardar el token en la base de datos
      await this.recoveryTokenRepository.save({
          userId: user.id,
          token: resetToken,
          expiresAt: resetTokenExpiry
      });

      // Enviar correo electrónico
      const resetUrl = `${this.BaseUrl}/auth/reset-password?token=${resetToken}`;
      // console.log('Generated reset URL:', resetUrl);
      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
      try {
          // Verificar si el token existe
          const recoveryToken = await this.recoveryTokenRepository.findOne({ where: { token } });
          if (!recoveryToken) {
              // console.log('Token de recuperación no encontrado:', token);
              throw new BadRequestException('Token de recuperación inválido o expirado');
          }

          // Verificar si el token ha expirado
          if (recoveryToken.expiresAt < new Date()) {
              // console.log('Token de recuperación expirado:', token);
              throw new BadRequestException('Token de recuperación inválido o expirado');
          }

          // Obtener el usuario asociado con el token
          const user = await this.userRepository.findOne({ where: { id: recoveryToken.userId } });
          if (!user) {
              // console.log('Usuario no encontrado para el token:', token);
              throw new NotFoundException('Usuario no encontrado');
          }

          // Actualizar la contraseña del usuario
          const hashedPassword = bcryptjs.hashSync(newPassword, 10);
          user.password = hashedPassword;
          await this.userRepository.save(user);

          // Eliminar el token de recuperación
          await this.recoveryTokenRepository.delete({ token });

          // console.log('Contraseña restablecida exitosamente para el usuario:', user.id);
      } catch (error) {
          console.error('Error en el servicio de restablecimiento de contraseña:', error);
          throw error; // Re-lanzar el error para que NestJS lo maneje
      }
  }


  async findTecnicoByEstablecimiento(establecimientoId: number): Promise<User> {
      const tecnico = await this.userRepository.findOne({
        where: {
          establecimiento: { id: establecimientoId },
          roles: {nombre:'tecnico_informatica'}
        },
        relations: ['roles']
      });
    
      if (!tecnico) {
        throw new NotFoundException('Técnico no encontrado para el establecimiento');
      }
    
      return tecnico;
    }

  async getTechnicians(): Promise<User[]> {
    return this.userRepository.find({ 
      where: {
        roles: { nombre: 'tecnico_informatica' } 
      },
      relations: ['roles']
    });
  }
  

}
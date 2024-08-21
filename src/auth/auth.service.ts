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
    
          // Encriptar la contraseña
          const hashedPassword = bcryptjs.hashSync(password, 10);
    
          // Manejar el establecimiento si se proporciona
          let est;
          if (establecimiento) {
            est = await this.establecimientoRepository.findOne({
              where: {
                email: establecimiento.email
              }
            });
    
            // Si no existe el establecimiento, créalo
            if (!est) {
              est = this.establecimientoRepository.create(establecimiento);
              est = await this.establecimientoRepository.save(est);
            }
          }
    
          // Crear el nuevo usuario
          const newUser = this.userRepository.create({
            ...userData,
            password: hashedPassword,
            establecimiento: est // Asociar el establecimiento si existe
          });
    
          // Guardar el nuevo usuario
          await this.userRepository.save(newUser);
    
          // Retornar el usuario como una instancia de User
          return plainToInstance(User, newUser);
    
        } catch (error) {
          if (error.code === '11000') {
            throw new BadRequestException(`${createUserDto.email} Ya existe!`);
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
            token: this.getJwtToken({ id: user.id })
        }
    }



    findAll(): Promise<User[]> {
        return this.userRepository.find()
    }

    async findUserById ( id: number ){
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new UnauthorizedException(`Usuario con ID ${id} no encontrado`);
        }

        const { password, ...restWithoutPassword } = user;
        // console.log(restWithoutPassword)
        return restWithoutPassword;
    }
    
   


    async findOne(id: number): Promise<User> {
      return this.userRepository.findOneBy({ id });  // Asegúrate de que devuelve un `User`
    }

    async update(id: number, updateAuthDto:UpdateUserDto): Promise<User>{
        await this.userRepository.update(id, updateAuthDto);
        return this.findOne(id);
    }

    // remove(id: number) {
    //     return 'This action remove a #${id} auth'
    // }
    
    getJwtToken( payload: jwtPayload ): string {
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
    console.log('Generated reset URL:', resetUrl);
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
}

async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
        // Verificar si el token existe
        const recoveryToken = await this.recoveryTokenRepository.findOne({ where: { token } });
        if (!recoveryToken) {
            console.log('Token de recuperación no encontrado:', token);
            throw new BadRequestException('Token de recuperación inválido o expirado');
        }

        // Verificar si el token ha expirado
        if (recoveryToken.expiresAt < new Date()) {
            console.log('Token de recuperación expirado:', token);
            throw new BadRequestException('Token de recuperación inválido o expirado');
        }

        // Obtener el usuario asociado con el token
        const user = await this.userRepository.findOne({ where: { id: recoveryToken.userId } });
        if (!user) {
            console.log('Usuario no encontrado para el token:', token);
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizar la contraseña del usuario
        const hashedPassword = bcryptjs.hashSync(newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);

        // Eliminar el token de recuperación
        await this.recoveryTokenRepository.delete({ token });

        console.log('Contraseña restablecida exitosamente para el usuario:', user.id);
    } catch (error) {
        console.error('Error en el servicio de restablecimiento de contraseña:', error);
        throw error; // Re-lanzar el error para que NestJS lo maneje
    }


    
}

}
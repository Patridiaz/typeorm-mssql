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

@Injectable()
export class AuthService {

    private readonly BASE_URL = 'http://localhost:4200';

    constructor(

        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        @InjectRepository(RecoveryToken)
        private recoveryTokenRepository: Repository<RecoveryToken>,
        private mailService: MailService

    ){}
    // Logica de crear usuario comienza aqui

    async createUser(createUserDto: CreateUserDto): Promise<User> {

        try {

            const { password, ...userData } = createUserDto;

            const hashedPassword = bcryptjs.hashSync(password, 10);
            const newUser = this.userRepository.create({
                ...userData,
                password: hashedPassword
            });

            // const newUser = this.userRepository.create( createUserDto);

            await this.userRepository.save(newUser)

            return plainToInstance(User, newUser);

        } catch (error) {
            if( error.code === 11000 ) {
                throw new BadRequestException(`${ createUserDto.email } Ya existe ! `)
            }
            throw new InternalServerErrorException('Algo terrible sucedio!')
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

        const { password: _, ...rest  } = user.toJSON();
        
        return {
            user: rest,
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
    
   


    findOne(id: number) {
        return `This action returns a #${id} auth`;
      }

    // update(id: number, updateAuthDto:UpdateUserDto) {
    //     return 'This action update a #${id} auth';
    // }

    // remove(id: number) {
    //     return 'This action remove a #${id} auth'
    // }
    
    getJwtToken( payload: jwtPayload ) {
        const token = this.jwtService.sign(payload);
        return token;
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
    const resetUrl = `${this.BASE_URL}/reset-password?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
}

async resetPassword(token: string, newPassword: string): Promise<void> {
    const recoveryToken = await this.recoveryTokenRepository.findOne({ where: { token } });
    if (!recoveryToken || recoveryToken.expiresAt < new Date()) {
        throw new BadRequestException('Token de recuperación inválido o expirado');
    }

    const user = await this.userRepository.findOne({ where: { id: recoveryToken.user.id } });
    if (!user) {
        throw new NotFoundException('Usuario no encontrado');
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Eliminar el token de recuperación usado
    await this.recoveryTokenRepository.delete({ token });
}
      
   
}
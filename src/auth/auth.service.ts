import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcryptjs from 'bcryptjs'
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {

    constructor(

        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService



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

        const { password: _, ...rest  } = user as any;
        
        return {
            user: rest,
            token: this.getJwtToken({ id: user.id })
        }

        // return 'Credenciales validas';
        
        //console.log({ loginDto })
    }



    findAll(): Promise<User[]> {
        return this.userRepository.find()
    }

    findOne(id:number) {
        return 'This action returns a #${id} auth';
    }

    update(id: number, updateAuthDto:UpdateUserDto) {
        return 'This action update a #${id} auth';
    }

    remove(id: number) {
        return 'This action remove a #${id} auth'
    }

    getJwtToken( payload: jwtPayload ):string {
        const token = this.jwtService.sign(payload);
        return token;
    }



}

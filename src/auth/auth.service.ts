import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    // Logica de crear usuario comienza aqui

    createUser(createUserDto: CreateUserDto) {
        return 'This action adds a new auth';
    }

    findAll() {
        return 'This action read all auth'
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





}

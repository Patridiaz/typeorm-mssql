import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.authService.createUser(createUserDto)
    }

    @Post('/login')
    login( @Body() loginDto: LoginDto  ) {
        return this.authService.login( loginDto )
    }


    @UseGuards( AuthGuard )
    @Get()
    findAll() {
        return this.authService.findAll();
    }

}

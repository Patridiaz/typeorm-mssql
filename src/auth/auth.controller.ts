import { Body, Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';

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
    findAll( @Request() req: Request ) {
        return this.authService.findAll();
    }



    // LoginResponse
  @UseGuards( AuthGuard )
  @Get('check-token')
  async checkToken( @Request() req: Request ):Promise<LoginResponse> {
      
    const user = req['user'] as any;

    const token = await this.authService.getJwtToken({ id: user.id})

    // console.log(user)

    return {
      user,
      token
    }
}
}


import { BadRequestException, Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, Put, Query, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Post('request-password-reset')
    async requestPasswordReset(@Body('email') email: string): Promise<void> {
        await this.authService.requestPasswordReset(email);
    }

    @Post('reset-password')
    async resetPassword(
        @Body('token') token: string, 
        @Body('newPassword') 
        newPassword: string) {
    return this.authService.resetPassword(token, newPassword);
  }

    // @Post('reset-password')
    // async resetPassword(
    //     @Body('token') token: string,
    //     @Body('newPassword') newPassword: string
    // ): Promise<void> {
    //     console.log('Received token backend:', token);
    //     console.log('Received newPassword backend:', newPassword);
    //     if (!token || !newPassword) {
    //         throw new BadRequestException('Token y nueva contraseña son requeridos');
    //     }
    
    //     await this.authService.resetPassword(token, newPassword);
    // }
    

    @UseGuards(AuthGuard) // Asegúrate de proteger esta ruta
    @Put(':id') // Usualmente se usa PUT para actualizaciones
    async updateUser(
        @Param('id') id: number, 
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        try {
            // Llama al servicio de actualización y maneja el resultado
            return await this.authService.updateUser(id, updateUserDto);
        } catch (error) {
            // Maneja posibles errores específicos
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
            } else if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException('No tienes permiso para realizar esta acción');
            } else if (error instanceof BadRequestException) {
                throw new BadRequestException('Datos de entrada inválidos');
            } else {
                // Si es otro tipo de error, lanza una excepción interna
                throw new InternalServerErrorException('Error al actualizar el usuario');
            }
        }
    }

    @Get('tecnico/:establecimientoId')
    async getTecnicoByEstablecimiento(@Param('establecimientoId') establecimientoId: number) {
      // Asegúrate de que el ID del establecimiento sea un número si tu método lo requiere
      return this.authService.findTecnicoByEstablecimiento(establecimientoId);
    }
  
    @Get('tecnicos')
    async getTechnicians(): Promise<User[]> {
      return this.authService.getTechnicians();
    }


}


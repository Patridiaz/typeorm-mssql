import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsString, IsOptional } from "class-validator";
import { CreateEstablecimientoDto } from "src/colegio/dto/create-colegio.dto";

export class UpdateUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    password?: string; // Contraseña opcional

    @IsOptional()
    @IsString()
    verifypassword?: string; // Confirmación de contraseña opcional

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsString() // Asegura que el rol sea una cadena
    rol: string;

    @IsOptional()
    establecimiento?: CreateEstablecimientoDto; // Objeto de establecimiento
}

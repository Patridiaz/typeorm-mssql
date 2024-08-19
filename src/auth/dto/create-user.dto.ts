import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsString, IsOptional } from "class-validator";
import { CreateEstablecimientoDto } from "src/colegio/dto/create-colegio.dto";


export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;
    
    @IsString()
    password: string;

    @IsString()
    verifypassword: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsString() // Asegura que cada elemento del array es una cadena
    rol: string;

    @IsOptional()
    establecimiento?: CreateEstablecimientoDto; // Objeto de establecimiento

}
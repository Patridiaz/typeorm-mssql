import { ArrayNotEmpty, IsArray, IsBoolean, IsEmail, IsString, IsOptional } from "class-validator";


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

}
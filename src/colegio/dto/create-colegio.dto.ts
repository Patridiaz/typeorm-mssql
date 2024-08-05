import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('establecimiento') //This maps the notes entity to the 'colegio' table in your DB

export class CreateEstablecimientoDto {

    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber(null, { message: 'Invalid phone number format' })
    telefono?: string;

    @IsString()
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;
    
  }
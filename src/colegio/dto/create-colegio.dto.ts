import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches } from "class-validator";
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


    @IsOptional()
    @Matches(/^[0-9]{9}$/, { message: 'Phone number must be exactly 9 digits' })
    telefono?: string;

    @IsString()
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    email?: string;
    
  }
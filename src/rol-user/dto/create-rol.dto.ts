import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('rolUser') //This maps the notes entity to the 'colegio' table in your DB

export class CreateRolUserDto {

    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

  }
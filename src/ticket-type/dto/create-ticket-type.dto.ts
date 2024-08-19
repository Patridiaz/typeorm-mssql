import { IsNotEmpty, IsString } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";


export class CreateTipoTicketDto{
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;





}
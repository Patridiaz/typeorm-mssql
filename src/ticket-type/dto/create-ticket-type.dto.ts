import { IsNotEmpty, IsString } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('TipoTicket')
export class CreateTipoTicketDto{
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @IsNotEmpty()
    name: string;





}
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('TipoTicket')
export class TipoTicket{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length:255 })
    name: string;




}
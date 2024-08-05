import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('Establecimiento')
export class Establecimiento{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length:255 })
    name: string;

    @Column({ type: 'nvarchar', length:255 })
    direccion: string;

    @Column({ type: 'nvarchar', length:50, nullable: true })
    telefono?: string;

    @Column({ type: 'varchar', length:255, nullable: true })
    email?: string;





}
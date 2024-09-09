import { Ticket } from "src/ticket/entity/ticket.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";

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

    @OneToMany(() => Ticket, ticket => ticket.establecimiento)
    tickets: Ticket[]; // Agrega esta propiedad para la relación inversa


}
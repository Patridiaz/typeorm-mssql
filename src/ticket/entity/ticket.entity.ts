import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { FileEntity } from './fileTicket.entity';

@Entity('ticket') //This maps the notes entity to the 'ticket' table in your DB

export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ length:9 , nullable:false })
    codigoIncidencia: string
  
    @Column({  length: 60, nullable: false })
    nombre: string;
  
    @Column({  length: 160, nullable: false })
    email: string;
  
    @Column({ type: 'nvarchar', nullable: true })
    anexo: string;

    @Column({  type: 'nvarchar',length: 1000 , nullable: false })
    incidencia: string;

    @Column({  type: 'nvarchar', nullable: true })
    subTipoIncidencia?: string;

    @Column({  type: 'nvarchar', nullable: true })
    comentario?: string;

    @Column({ type: 'nvarchar', nullable: false })
    estado: string;

    @ManyToOne(() => Establecimiento, { eager: true })
    establecimiento: Establecimiento; // Asegúrate de que esté definido

    @Column({ type: 'nvarchar', nullable: false })
    tipoIncidencia: string;

    @Column({ type: 'datetime2' })
    fecha: Date;

    @ManyToOne(() => User, user => user.createdTickets, { eager: true })
    createdBy: User;
  
    @ManyToOne(() => User, user => user.assignedTickets, { nullable: true, eager: true })
    assignedTo?: User;

    @ManyToOne(() => FileEntity, (file) => file.ticket, { cascade: true })
    file: FileEntity;
    
  }
import { User } from 'src/auth/entity/user.entity';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('ticket') //This maps the notes entity to the 'ticket' table in your DB

export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({  length: 60, nullable: false })
    nombre: string;
  
    @Column({  length: 160, nullable: false })
    email: string;
  
    @Column({ type: 'nvarchar', nullable: false })
    anexo: string;

    @Column({  type: 'nvarchar', nullable: false })
    incidencia: string;

    @Column({  type: 'nvarchar', nullable: true })
    comentario: string;

    @Column({ type: 'nvarchar', nullable: false })
    estado: string;

    @ManyToOne(() => Establecimiento, { eager: true })
    establecimiento: Establecimiento; // Asegúrate de que esté definido

    @Column({ type: 'nvarchar', nullable: false })
    tipoIncidencia: string;

    @Column({ type: 'datetime2' })
    fecha: Date;

    @ManyToOne(() => User, user => user.createdTickets)
    createdBy: User;
  
    @ManyToOne(() => User, { nullable: true })
    assignedTo?: User;

    
    
  }
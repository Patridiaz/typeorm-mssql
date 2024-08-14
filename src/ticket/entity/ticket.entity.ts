import { User } from 'src/auth/entity/user.entity';
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

    @Column({ type: 'nvarchar', nullable: false })
    estado: string;

    @Column({ type: 'nvarchar', nullable: false })
    establecimiento: string;

    @CreateDateColumn({ type: 'date', nullable: false })
    fecha: Date;

    @ManyToOne(() => User, user => user.createdTickets)
    createdBy: User;
  
    @ManyToOne(() => User, user => user.assignedTickets, { nullable: true })
    assignedTo: User;
    
  }
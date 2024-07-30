import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('ticket') //This maps the notes entity to the 'notes' table in your DB

export class Ticket {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'name', length: 60, nullable: false })
    name: string;
  
    @Column({ name: 'email', length: 160, nullable: false })
    email: string;
  
    @Column({ name: 'anexo', type: 'int', nullable: false })
    anexo: number;

    
  }
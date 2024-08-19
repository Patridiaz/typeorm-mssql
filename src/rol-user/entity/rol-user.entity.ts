import { User } from 'src/auth/entity/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('rolUser') //This maps the notes entity to the 'ticket' table in your DB

export class RolUser {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({  length: 60, nullable: false })
    nombre: string;
  
  }
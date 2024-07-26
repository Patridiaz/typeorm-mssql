import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user') //This maps the notes entity to the 'notes' table in your DB

export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number;
  
    @Column({ name: 'name', length: 60, nullable: false })
    name: string;
  
    @Column({ name: 'email', length: 160, nullable: false })
    email: string;
  
    @Column({ name: 'password', type: 'string', nullable: false })
    anexo: number;

    @Column({ name: 'isActive', type: 'string', nullable: false })
    isAcive: boolean;
    
    @Column("text", {array:true, default:['user'] })
    roles: string[]; 
  }



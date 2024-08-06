import { Exclude } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('user') //This maps the notes entity to the 'notes' table in your DB

export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'name', length: 60, nullable: false })
    name: string;
  
    @Column({ name: 'email', length: 160, nullable: false, unique:true })
    email: string;

    @Column({ name: 'password', type: 'nvarchar', nullable: false })
    password: string;


    @Column({ name:'isActive' ,type: 'bit', nullable: false, default:true })
    isActive: boolean;
    
    @Column({name:'rol', type:'nvarchar', nullable:false, default:'user'})
    rol: string

    toJSON() {
        // Personaliza la conversión a JSON
        const {  ...userData } = this;
        return userData;
    }
    
}

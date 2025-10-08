import { User } from "src/auth/entity/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity('rolUser')
export class RolUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 60, nullable: false, unique: true }) // Añade unique: true
    nombre: string;
    
    // ✅ CLAVE: Relación Many-to-Many con la entidad User
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];
}
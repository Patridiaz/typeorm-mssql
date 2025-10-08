import { Exclude } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { RecoveryToken } from "./recovery-token.entity";
import { Ticket } from "src/ticket/entity/ticket.entity";
import { Establecimiento } from "src/colegio/entity/colegio.entity";
import { InventoryItem } from "src/inventario/entity/inventario.entity";
import { RolUser } from "src/rol-user/entity/rol-user.entity";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 60, nullable: false })
  name: string;

  @Column({ name: 'email', length: 160, nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', type: 'nvarchar', nullable: false })
  password: string;

  @Column({ name: 'isActive', type: 'bit', nullable: false, default: true })
  isActive: boolean;

  @ManyToMany(() => RolUser, (rolUser) => rolUser.users, { eager: true }) // eager: true para cargar roles
  @JoinTable({ name: 'user_roles' }) // Nombre de la tabla de unión
  roles: RolUser[];

  @ManyToOne(() => Establecimiento, { eager: true })
  @JoinColumn({ name: 'establecimientoId' })
  establecimiento: Establecimiento;

  @OneToMany(() => RecoveryToken, recoveryToken => recoveryToken.user)
  recoveryTokens: RecoveryToken[];

  @OneToMany(() => Ticket, ticket => ticket.createdBy)
  createdTickets: Ticket[];

  @OneToMany(() => Ticket, ticket => ticket.assignedTo)
  assignedTickets: Ticket[];

  toJSON() {
    // Personaliza la conversión a JSON
    const { password, ...userData } = this;
    return userData;
  }
}

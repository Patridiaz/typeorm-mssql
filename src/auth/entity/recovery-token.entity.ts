import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RecoveryToken {
  @PrimaryGeneratedColumn()
    id: number; // Esta será tu clave primaria
    
    @Column()
    token: string;

    @Column()
    expiresAt: Date;

    @Column()
    userId: number; // Esta columna es necesaria

    @ManyToOne(() => User, user => user.recoveryTokens)
    @JoinColumn({ name: 'userId' })
    user: User; // Esta propiedad es opcional si tienes una relación bidireccional
}

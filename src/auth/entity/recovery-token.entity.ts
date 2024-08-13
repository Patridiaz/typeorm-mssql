import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('recovery_token')
export class RecoveryToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token', type: 'nvarchar', unique: true, nullable: false })
  token: string;

  @Column({ name: 'expiresAt', type: 'datetime', nullable: false })
  expiresAt: Date;

  @ManyToOne(() => User, user => user.recoveryTokens)
  user: User;
}

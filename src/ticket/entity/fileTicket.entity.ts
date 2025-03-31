import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity()
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @OneToMany(() => Ticket, (ticket) => ticket.file, { onDelete: 'CASCADE' })
  ticket: Ticket;

}

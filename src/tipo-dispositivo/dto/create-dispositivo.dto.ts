// src/tipo-dispositivo/entities/tipo-dispositivo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TipoDispositivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tipo: string;

  @Column({ nullable: true })
  categoria: string;
}

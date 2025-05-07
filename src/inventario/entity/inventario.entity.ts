// src/inventory/entity/inventory-item.entity.ts
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from 'src/auth/entity/user.entity';
import { MarcaDispositivo } from 'src/marca-dispositivo/entity/marca-dispositivo.entity';
import { TipoDispositivo } from 'src/tipo-dispositivo/entity/tipo-dispositivo.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime2' })
  fechaIngreso: Date;

  @Column()
  @IsString()
  @IsOptional()
  numeroSerie?: string;
  
  @Column()
  @IsString()
  marca: string;

  @Column()
  @IsString()
  modelo: string;

  @Column()
  @IsNumber()
  userId: number; // Campo para identificar el usuario responsable
  
  
  // Relación con TipoDispositivo
  @ManyToOne(() => TipoDispositivo, { eager: true })
  tipoDispositivo: TipoDispositivo;  

  // Relación con Marca
  @ManyToOne(() => MarcaDispositivo, { eager: true })
  marcaDispositivo: MarcaDispositivo;  
}

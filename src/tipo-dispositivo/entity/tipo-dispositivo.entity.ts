
import { IsString, Matches, MaxLength } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert,  } from 'typeorm';
import { TipoDispositivoService } from '../tipo-dispositivo.service';
import { ConflictException } from '@nestjs/common';

@Entity()
export class TipoDispositivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @MaxLength(50, { message: 'El tipo de dispositivo no puede exceder los 50 caracteres.' })
  @Matches(/^[a-zA-Z-]+$/, { message: 'El tipo de dispositivo solo debe contener letras y guiones.' })
  tipo: string;

  @Column()
  @IsString()
  @MaxLength(50, { message: 'La categoría no puede exceder los 50 caracteres.' })
  @Matches(/^[a-zA-Z]+$/, { message: 'La categoría solo debe contener letras.' })
  categoria: string;
  tipoDispositivoRepository: TipoDispositivoService;

  
}
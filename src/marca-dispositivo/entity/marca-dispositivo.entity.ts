
import { IsString, Matches, MaxLength } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert,  } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { MarcaDispositivoService } from '../marca-dispositivo.service';

@Entity()
export class MarcaDispositivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @MaxLength(20, { message: 'La marca de dispositivo no puede exceder los 20 caracteres.' })
  marca: string;

  marcaDispositivoRepository: MarcaDispositivoService;  


}
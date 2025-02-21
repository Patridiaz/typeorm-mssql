import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";
import { Type } from 'class-transformer';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional() // El ID del técnico puede no ser obligatorio
  @IsInt()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  establecimiento?: number;

  @IsOptional()
  @IsString()
  subTipoIncidencia?: string;

  @IsOptional()
  @IsString()
  tipoIncidencia?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  anexo?: string;

  @IsOptional()
  @IsString()
  incidencia?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;
}

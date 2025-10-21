import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";
import { Transform, Type } from 'class-transformer';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional() 
  @Type(() => Number) // ✅ AÑADE ESTA LÍNEA
  @IsInt()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value)) // <- Convierte a número
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

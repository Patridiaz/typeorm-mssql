import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsDate, IsOptional, IsNumber } from 'class-validator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  establecimiento: number;

  @IsOptional()
  @IsString()
  subTipoIncidencia?: string;

  @IsNotEmpty()
  @IsString()
  tipoIncidencia: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  anexo: string;

  @IsNotEmpty()
  @IsString()
  incidencia: string;

  @IsOptional()
  @IsString()
  comentario: string;

  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @IsOptional()
  @IsNumber()
  assignedTo?: number;
}


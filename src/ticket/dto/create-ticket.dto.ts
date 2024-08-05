import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  establecimiento: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  anexo: string;

  @IsNotEmpty()
  @IsString()
  incidencia: string;

  @IsNotEmpty()
  @IsString()
  estado: string;


  @IsString()
  tecnico: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha: Date;
}
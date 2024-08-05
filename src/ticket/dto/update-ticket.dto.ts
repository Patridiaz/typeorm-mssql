import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";


export class UpdateTicketDto {
    
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  establecimiento: string;

  @IsNotEmpty()
  @IsString()
  incidencia: string;

  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsNotEmpty()
  @IsString()
  tecnico: string;

  @IsNotEmpty()
  @IsDate()
  fecha: Date;
  }
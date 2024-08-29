import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsDate, IsOptional, IsNumber } from 'class-validator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  establecimiento: string;

  @IsNotEmpty()
  @IsString()
  tipoIncidencia: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
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


  @IsOptional()
  @IsNumber({}, { each: true })
  tecnico?: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha: Date;

  assignedTo?: UserDto;  // Asegúrate de incluir esta propiedad

  // Puedes incluir el UserDto si lo usas
}

export class UserDto {
  id: number;
  name: string;
}
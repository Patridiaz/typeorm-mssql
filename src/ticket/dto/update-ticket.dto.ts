import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UpdateTicketDto {
    
  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsNotEmpty()
  @IsString()
  comentario: string;

  @IsOptional() // El ID del técnico puede no ser obligatorio
  @IsInt()
  assignedTo?: number;
  
  }
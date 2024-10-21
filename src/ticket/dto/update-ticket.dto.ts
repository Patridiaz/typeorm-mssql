import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";


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
  
  }
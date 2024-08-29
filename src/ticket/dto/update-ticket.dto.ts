import { IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";


export class UpdateTicketDto {
    
  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsNotEmpty()
  @IsString()
  comentario: string;

  
  }
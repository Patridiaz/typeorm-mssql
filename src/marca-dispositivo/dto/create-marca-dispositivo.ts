import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

// Ejemplo de DTO para crear un InventoryItem
export class CreateMarcaDto {
    
    @PrimaryGeneratedColumn()
    id: number;
    
    @IsString()
    marca: string;

  }
  
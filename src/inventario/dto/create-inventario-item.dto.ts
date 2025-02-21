import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

// Ejemplo de DTO para crear un InventoryItem
export class CreateInventoryItemDto {
    @IsString()
    marca: string;
  
    @IsString()
    modelo: string;
  
    @IsOptional()
    numeroSerie?: string;
  
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    fechaIngreso: Date;
  
    @IsNumber()
    tipoDispositivoId: number; // Recibe el ID de TipoDispositivo

    @IsNumber()
    userId: number; // Campo para identificar el usuario responsable

  }
  
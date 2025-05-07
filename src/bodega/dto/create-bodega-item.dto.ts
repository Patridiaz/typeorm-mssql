// create-bodega.dto.ts
import { IsIn, IsInt, IsString } from 'class-validator';

export class CreateBodegaDto {
  @IsString()
  nombre: string;

  @IsIn(['Material', 'Herramienta'])
  tipo: string;

  @IsInt()
  cantidad: number;

  @IsString()
  unidad: string;

  @IsIn(['Disponible', 'Agotado', 'Mantenimiento'])
  estado: string;
}

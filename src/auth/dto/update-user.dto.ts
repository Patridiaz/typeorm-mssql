import { IsOptional, IsEmail, IsString, IsBoolean, IsArray, IsInt } from "class-validator";
import { CreateEstablecimientoDto } from "src/colegio/dto/create-colegio.dto";

export class UpdateUserDto {
    // ... (campos existentes)
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
    
    // 💡 CAMBIO CLAVE: Cambiar 'rol: string' por 'roleIds: number[]'
    @IsOptional()
    @IsArray()
    @IsInt({ each: true }) // Asegura que cada elemento del array sea un entero (ID)
    roleIds?: number[]; // Array de IDs de los roles a asignar
    
    // Si necesitas cambiar el establecimiento:
    @IsOptional()
    establecimientoId?: number; // Usar solo el ID
}
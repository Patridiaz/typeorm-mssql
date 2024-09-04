import { IsEmail, IsOptional, IsPhoneNumber, IsString, Matches } from "class-validator";

export class UpdateEstablecimientoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @Matches(/^[0-9]{9}$/, { message: 'Phone number must be exactly 9 digits' })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
}

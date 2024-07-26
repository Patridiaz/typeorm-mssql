import { IsInt, IsNotEmpty } from "class-validator";


export class CreateTicketDto {
    
    @IsNotEmpty({ message: 'El nombre no puede ir vacio' })
    name: string;
  
    @IsNotEmpty({ message: 'El mail no puede ir vacio' })
    email: string;
  
    @IsNotEmpty({ message: 'El nombre no puede ir vacio' })
    @IsInt({ message: 'Anexo debe ser numerico' })
    anexo: number;

  }
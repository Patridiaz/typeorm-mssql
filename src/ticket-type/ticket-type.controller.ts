import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { CreateTipoTicketDto } from './dto/create-ticket-type.dto';
import { TipoTicket } from './entity/tipo-ticket.entity';

@Controller('tipoTicket')
export class TipoTicketController {

    constructor(private readonly tipoTicketSercvice : TicketTypeService){}


    // Creación de los tipos de ticket
    @Post()
    async createEstablecimiento(@Body() createtipoTicketDto:CreateTipoTicketDto) {
        return this.tipoTicketSercvice.createTipoTicket(createtipoTicketDto)
    }

    // Obtenemos todos los tipos de ticket
    @Get()
    getEstablecimientos(){
        return this.tipoTicketSercvice.fetchTipoTicket();
    }

    // Obtenemos tipos de ticket por ID
    @Get(':id')
    getEstablecimientoById(@Param('id') id: number ): Promise<TipoTicket> {
        return this.tipoTicketSercvice.fetchTipoTicketById(id)
    }

    

}

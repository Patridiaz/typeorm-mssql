import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entity/ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('ticket')
export class TicketController {
    constructor(private readonly ticketService:TicketService) {}

    //Se obtiene todo
    @Get()
    getTickets() {
        return this.ticketService.fetchTickets();
    }

    //Se agrega un ticket
    @Post()
    createTicket(@Body() createTicketDto: CreateTicketDto ): Promise<Ticket> {
        return this.ticketService.addTicket(createTicketDto)
    }

    //Se obtiene un ticket por id
    @Get('/:id')
    getTicketById(@Param('id') id: number): Promise<Ticket> {
        return this.ticketService.fetchTicketById(id);
    }

    // Delete a note by ID
    @Delete('/:id')
    delete(@Param('id') id: string) {
    return this.ticketService.removeTicket(id);
    }

    // Update a note by ID
    @Put('/:id')
    async updateTicket(@Param('id') id: number, @Body() data: UpdateTicketDto) {
    const ticket = new Ticket();
    Object.assign(ticket, data);
    await this.ticketService.updateTicket(id, ticket);
    return { message: 'Ticket fue actualizado correctamente ! ', id };
    }
    }


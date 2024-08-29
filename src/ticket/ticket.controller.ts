import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entity/ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Request } from 'express';
import { User } from 'src/auth/entity/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Response } from 'express';

@Controller('ticket')
@UseGuards(AuthGuard) // Aplicar el AuthGuard a todas las rutas en este controlador
export class TicketController {
    constructor(private readonly ticketService:TicketService) {}

    @Get()
  async getTickets(@Req() req: Request): Promise<Ticket[]> {
    const user = req['user'];

    if (user.rol === 'admin') {
      return this.ticketService.fetchTickets(); // Admin puede ver todos los tickets
    } else if (user.rol === 'user') {
      return this.ticketService.fetchTicketsByUserId(user.id); // User solo puede ver sus propios tickets
    } else if (user.rol === 'tecnico_informatica' || user.rol === 'tecnico_mantencion') {
      return this.ticketService.fetchTicketsByTechnicianId(user.id); // Técnico solo puede ver los tickets asignados a él
    } else {
      throw new ForbiddenException('No tienes permiso para ver los tickets');
    }
  }

  // Controlador en el backend
  @Get('/count')
  async countTicketsByType(@Query('tipoIncidencia') tipoIncidencia: string): Promise<number> {
    // console.log('Tipo de incidencia recibido:', tipoIncidencia);
    try {
      const count = await this.ticketService.countTicketsByType(tipoIncidencia);
      // console.log('Conteo de tickets:', count);
      return count;
    } catch (error) {
      // console.error('Error al obtener el conteo de tickets:', error);
      throw new InternalServerErrorException('Error al obtener el conteo de tickets');
    }
  }

  @Get('/latest')
  async getLatestTickets(): Promise<Ticket[]> {
      try {
          const tickets = await this.ticketService.getLatestTickets();
          // console.log('Sending latest tickets:', tickets); // Verifica los datos aquí
          return tickets; // NestJS se encargará de la respuesta JSON
      } catch (error) {
          console.error('Error fetching latest tickets:', error);
          throw new InternalServerErrorException('Error fetching latest tickets');
      }
  }



    //Se agrega un ticket
    @Post()
    async createTicket(@Body() createTicketDto: CreateTicketDto, @Req() req: any) {
      const userId = req.user.id; // Suponiendo que el ID del usuario está en `req.user`
      return this.ticketService.addTicket(createTicketDto, userId);
    }


    
    @Get('/:id')
    async getTicketById(@Param('id') id: number, @Req() req: Request): Promise<Ticket> {
      const user = req['user'];
      // console.log('Usuario:', user);
    
      const ticket = await this.ticketService.fetchTicketById(id);
      // console.log('Ticket:', ticket);
    
      if (ticket) {
        // console.log('Ticket creado por ID:', ticket.createdBy?.id);
        // console.log('Ticket asignado a ID:', ticket.assignedTo?.id);
      } else {
        // console.log('No se encontró el ticket con el ID proporcionado');
      }
    
      // Comprobar si el usuario tiene permiso para ver el ticket
      // Comprobar si el usuario tiene permiso para ver el ticket
      if (user.rol === 'admin' || user.id === ticket.createdBy?.id || (ticket.assignedTo && user.id === ticket.assignedTo?.id)) {
        return ticket; // Admin, creador o técnico asignado puede ver el ticket
      } else {
        throw new ForbiddenException('No tienes permiso para ver este ticket');
      }
    }
    
    // // Delete a ticket by ID
    // @Delete('/:id')
    // delete(@Param('id') id: string) {
    // return this.ticketService.removeTicket(id);
    // }

    // Update a ticket by ID
    @Put('/:id')
  async updateTicket(@Param('id') id: number, @Body() updateTicketDto: UpdateTicketDto, @Req() req: Request) {
    const user = req['user'];

    // Verifica que el usuario tenga el rol adecuado
    if (user.rol !== 'admin' && user.rol !== 'tecnico_informatica' && user.rol !== 'tecnico_mantencion') {
      throw new ForbiddenException('No tienes permiso para actualizarla información del ticket');
    }

    // Verifica si el ticket existe
    const ticket = await this.ticketService.fetchTicketById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    // Actualiza el ticket con los datos del DTO
    await this.ticketService.updateTicket(id, updateTicketDto);

    return { message: 'Estado del ticket actualizado correctamente', id };
  }
}



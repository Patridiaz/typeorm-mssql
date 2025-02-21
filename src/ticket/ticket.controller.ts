import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entity/ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Request } from 'express';
import { User } from 'src/auth/entity/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Response } from 'express';
import { MailService } from 'src/auth/mail.service';

@Controller('ticket')
@UseGuards(AuthGuard) // Aplicar el AuthGuard a todas las rutas en este controlador
export class TicketController {
    constructor(
      private readonly ticketService:TicketService,
      private readonly mailService: MailService // Inyectar MailService
    ) {}

  @Get()
  async getTickets(@Req() req: Request): Promise<Ticket[]> {
    const user = req['user'];

    if (user.rol === 'admin') {
      return this.ticketService.fetchTickets(); // Admin puede ver todos los tickets
    } else if (user.rol === 'user') {
      return this.ticketService.fetchTicketsByUserId(user.id); // User solo puede ver sus propios tickets
    } else if (user.rol === 'tecnico_informatica' || user.rol === 'admin_mantencion') {
      return this.ticketService.findTicketsByRole(user); // Técnico solo puede ver los tickets asignados a él
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

  @Get('/role')
  async getTicketsByRole(@Req() req: Request): Promise<Ticket[]> {
    const user = req['user'];
    // console.log('Solicitud para obtener tickets. Usuario:', user);

    const tickets = await this.ticketService.findTicketsByRole(user);

    if (tickets.length === 0) {
      throw new NotFoundException('No se encontraron tickets para el usuario.');
    }

    // console.log('Tickets encontrados:', tickets);
    return tickets;
  }

  @Get('/:id')
  async getTicketById(@Param('id') id: number, @Req() req: Request): Promise<Ticket> {
    const user = req['user'];
    const ticket = await this.ticketService.fetchTicketById(id);

    if (ticket) {
      if (user.rol === 'admin' || user.id === ticket.createdBy?.id || (ticket.assignedTo && user.id === ticket.assignedTo?.id)) {
        return ticket;
      } else {
        throw new ForbiddenException('No tienes permiso para ver este ticket');
      }
    } else {
      throw new NotFoundException('Ticket no encontrado');
    }
  }


  //Se agrega un ticket
  @Post()
  async createTicket(@Body() createTicketDto: CreateTicketDto, @Req() req: any) {
    const userId = req.user.id; // Suponiendo que el ID del usuario está en `req.user`
    
    // Verificar si el tipo de incidencia es "Mantención" y agregar subtipo
    if (createTicketDto.tipoIncidencia === 'Mantencion' && !createTicketDto.subTipoIncidencia) {
      throw new ForbiddenException('Es necesario un subtipo para los tickets de mantención.');
    }
    
    // Crear el ticket
    const createdTicket = await this.ticketService.addTicket(createTicketDto, userId);
    
    // Enviar correo al usuario que creó el ticket
    const recipientEmail = createTicketDto.email;
    await this.mailService.sendTicketCreationEmail(recipientEmail, createdTicket);
  
    // Enviar correo al técnico asignado
    if (createdTicket.assignedTo && createdTicket.assignedTo.email) {
      const technicianEmail = createdTicket.assignedTo.email;
      await this.mailService.sendTicketAssignedEmail(technicianEmail, createdTicket);
    }
    
    return createdTicket;
  }

      // Actualiza un ticket por ID
      @Put('/:id')
      async updateTicket(
        @Param('id') id: number,
        @Body() updateTicketDto: UpdateTicketDto,
        @Req() req: Request
      ) {
        const user = req['user'];
      
        // Verifica que el usuario tenga el rol adecuado
        if (!['admin', 'tecnico_informatica', 'admin_mantencion'].includes(user.rol)) {
          throw new ForbiddenException('No tienes permiso para actualizar la información del ticket');
        }
      
        // Verifica si el ticket existe
        const ticket = await this.ticketService.fetchTicketById(id);
        if (!ticket) {
          throw new NotFoundException('Ticket no encontrado');
        }
      
        // Solo permite ciertas actualizaciones si el rol es tecnico_informatica o admin_mantencion
        if (user.rol === 'tecnico_informatica' || user.rol === 'admin_mantencion') {
          // Limita los campos que pueden ser actualizados
          updateTicketDto = {
            estado: updateTicketDto.estado,       // Permitir actualizar solo el estado
            comentario: updateTicketDto.comentario, // Permitir actualizar el comentario
            nombre: updateTicketDto.nombre,// Permitir actualizar el comentario
            establecimiento: updateTicketDto.establecimiento, // Permitir actualizar el comentario
            subTipoIncidencia: updateTicketDto.subTipoIncidencia, // Permitir actualizar el comentario
            tipoIncidencia: updateTicketDto.tipoIncidencia, // Permitir actualizar el comentario
            email : updateTicketDto.email , // Permitir actualizar el comentario
            anexo  : updateTicketDto.anexo  , // Permitir actualizar el comentario
            incidencia : updateTicketDto.incidencia , // Permitir actualizar el comentario
            assignedTo : updateTicketDto.assignedTo,
          };
        }
      
        // Actualiza el ticket con los datos del DTO
        await this.ticketService.updateTicket(id, updateTicketDto);
      
        // Recupera el ticket actualizado para enviar la información correcta en el correo
        const updatedTicket = await this.ticketService.fetchTicketById(id);
      
        // Enviar correo al creador del ticket sobre la actualización
        const recipientEmail = updatedTicket.email; // Suponiendo que el campo `email` en el ticket contiene el correo del creador
        await this.mailService.sendTicketUpdateEmail(recipientEmail, updatedTicket);
        
          // Enviar correo al técnico asignado si existe
        const technicianEmail = updatedTicket.assignedTo?.email; // Suponiendo que assignedTo tiene un campo email
        if (technicianEmail) {
          await this.mailService.sendTicketUpdateEmail(technicianEmail, updatedTicket);
        }
      
        return { message: 'Ticket actualizado correctamente', id };
      }

     
  }



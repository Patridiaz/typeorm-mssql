import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Ticket } from './entity/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { User } from 'src/auth/entity/user.entity';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';

@Injectable()
export class TicketService {

    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Establecimiento)
        private readonly establecimientoRepository: Repository<Establecimiento>,
    ){}

    async addTicket(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
      // Desestructurar los datos del ticket
      const { tipoIncidencia, establecimiento, assignedTo, ...ticketData } = createTicketDto;
    
      // Buscar el usuario que está creando el ticket
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['establecimiento'],
      });
    
      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }
    
      let tecnicoUser = null;
      let ticketEstado = 'Pendiente'; // Estado por defecto
    
      // Buscar el establecimiento por ID
      const establecimientoEntity = await this.establecimientoRepository.findOne({
        where: { id: establecimiento }
      });
    
      if (!establecimientoEntity) {
        throw new NotFoundException('Establecimiento no encontrado');
      }
    
      // Determinar la asignación del técnico
      if (tipoIncidencia === 'Informatica' && assignedTo) {
        tecnicoUser = await this.userRepository.findOne({ where: { id: assignedTo } });
    
        if (tecnicoUser) {
          ticketEstado = 'Asignado';
        } else {
          ticketEstado = 'Técnico por asignar';
        }
      } else if (tipoIncidencia === 'Mantencion') {
        // Buscar al usuario admin_mantencion
        tecnicoUser = await this.userRepository.findOne({ where: { rol: 'admin_mantencion' } });
    
        if (tecnicoUser) {
          ticketEstado = 'Asignado';
        } else {
          throw new NotFoundException('Usuario admin_mantencion no encontrado');
        }
      }
    
      // Crear el ticket
      const ticket = this.ticketRepository.create({
        ...ticketData,
        tipoIncidencia,
        createdBy: user,
        assignedTo: tecnicoUser, // Solo asignar si existe un técnico
        estado: ticketEstado,
        establecimiento: establecimientoEntity, // Asignar el establecimiento
      });
    
      try {
        const savedTicket = await this.ticketRepository.save(ticket);
        return savedTicket;
      } catch (error) {
        console.error('Error al guardar el ticket:', error);
        throw new InternalServerErrorException('Error al guardar el ticket');
      }
    }
    
    

    // Obtenemos (FETCH)  todas los tickets de la base de datos
    async fetchTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find();
    }

    async fetchTicketById(id: number): Promise<Ticket> {
      try {
        return await this.ticketRepository.createQueryBuilder('ticket')
          .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
          .leftJoinAndSelect('ticket.createdBy', 'createdBy')
          .leftJoinAndSelect('ticket.establecimiento', 'establecimiento') // Asegúrate de incluir esta relación
          .where('ticket.id = :id', { id })
          .getOne();
      } catch (error) {
        console.error('Error fetching ticket by ID:', error);
        throw new InternalServerErrorException('Error fetching ticket by ID');
      }
    }
    

    async updateTicket(id: number, updateTicketDto: UpdateTicketDto): Promise<void> {
      // Buscar el ticket por ID
      const ticket = await this.ticketRepository.findOne({ where: { id } });
      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }
    
      // Actualizar los campos con los datos del DTO
      if (updateTicketDto.estado) {
        ticket.estado = updateTicketDto.estado;
      }
      if (updateTicketDto.comentario) {
        ticket.comentario = updateTicketDto.comentario;
      }
      if (updateTicketDto.assignedTo !== undefined) {
        // Buscar el usuario técnico por ID
        const user = await this.userRepository.findOne({ where: { id: updateTicketDto.assignedTo } });
        if (!user) {
          throw new NotFoundException('Técnico no encontrado');
        }
        // Asignar el técnico al ticket
        ticket.assignedTo = user;
        // Cambiar el estado del ticket a 'activo' cuando se asigne un técnico
        ticket.estado = 'Asignado'; 
      }
    
      // Guardar los cambios en el repositorio
      await this.ticketRepository.save(ticket);
    }
    
    

    //Eliminar ticket de la base de datos por ID
    async removeTicket(id:string){
        const result = await this.ticketRepository.delete(id);
        if (result.affected === 0){
            throw new NotFoundException(`Ticket "${id}" no se encuentra`)
        }
        return {message: 'Ticket fue eliminado con exito.!'}
    }


    async findTickets(user: User): Promise<Ticket[]> {
      const query = this.ticketRepository.createQueryBuilder('ticket');
    
      if (user.rol === 'admin') {
        return query.getMany(); // Admin puede ver todos los tickets
      } else if (user.rol === 'user') {
        return query
          .where('ticket.createdById = :userId', { userId: user.id })
          .getMany(); // Usuario puede ver solo sus tickets
      } else if (user.rol.startsWith('tecnico_')) {
        return query
          .where('ticket.assignedToId = :userId', { userId: user.id })
          .getMany(); // Técnicos pueden ver solo los tickets asignados a ellos
      } else if (user.rol === 'admin_mantencion') {
        return query
          .where('ticket.assignedToId = :userId', { userId: user.id })
          .orWhere('ticket.createdById = :userId', { userId: user.id }) // Añadir si admin_mantencion también necesita ver sus propios tickets
          .getMany(); // admin_mantencion puede ver tickets asignados a él
      } else {
        throw new Error('Role not recognized');
      }
    }
    
    
      // Obtener tickets creados por un usuario específico
  async fetchTicketsByUserId(userId: number): Promise<Ticket[]> {
    return this.ticketRepository.createQueryBuilder('ticket')
      .where('ticket.createdById = :userId', { userId })
      .getMany();
  }

  async fetchTicketsByTechnicianId(technicianId: number): Promise<Ticket[]> {
    try {
      console.log('Technician ID:', technicianId); // Verifica que el ID sea correcto
      return await this.ticketRepository.createQueryBuilder('ticket')
        .where('ticket.assignedToId = :technicianId', { technicianId })
        .getMany();
    } catch (error) {
      console.error('Error fetching tickets by technician ID:', error);
      throw new InternalServerErrorException('Error fetching tickets by technician ID');
    }
  }
  
  
    // Método para obtener el total de tickets de mantención
    async countTicketsByType(tipoIncidencia: string): Promise<number> {
      try {
        const count = await this.ticketRepository.count({
          where: { tipoIncidencia },
        });
        return count; // Devuelve el conteo
      } catch (error) {
        throw new InternalServerErrorException('Error al contar tickets por tipo');
      }
    }

  async getLatestTickets(): Promise<Ticket[]> {
    try {
        const tickets = await this.ticketRepository.createQueryBuilder('ticket')
            .orderBy('ticket.fecha', 'DESC')
            .limit(10)
            .getMany();
        
        if (tickets.length === 0) {
            console.warn('No tickets found.');
        }
        
        // console.log('Tickets fetched:', tickets);
        return tickets;
    } catch (error) {
        console.error('Error fetching latest tickets:', error);
        throw new InternalServerErrorException('Error fetching tickets');
    }
}
}

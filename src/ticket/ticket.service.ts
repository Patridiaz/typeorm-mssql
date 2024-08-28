import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Ticket } from './entity/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { User } from 'src/auth/entity/user.entity';

@Injectable()
export class TicketService {

    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepository: Repository<Ticket>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ){}

    // La Logica del CRUD para el tickets comienza aqui
    async addTicket(createTicketDto: CreateTicketDto, userId: number): Promise<Ticket> {
      const { tecnico, tipoIncidencia, ...ticketData } = createTicketDto;
    
      // Buscar el usuario que está creando el ticket
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['establecimiento'], // Asegúrate de cargar el establecimiento relacionado
      });
    
      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }
    
      let tecnicoUser = null;
    
      // Asignar técnico solo si el tipo de incidencia es "Informatica"
      if (tipoIncidencia === 'Informatica') {
        if (tecnico) {
          tecnicoUser = await this.userRepository.findOne({ where: { id: Number(tecnico) } });
        } else {
          tecnicoUser = await this.userRepository.findOne({
            where: {
              establecimiento: user.establecimiento,
              rol: 'tecnico_informatica',
            },
          });
    
          if (!tecnicoUser) {
            throw new ForbiddenException('No se encontró un técnico asignado para este colegio');
          }
        }
      }
    
      // Crear el ticket asegurando que tipoIncidencia se incluye
      const ticket = this.ticketRepository.create({
        ...ticketData,
        tipoIncidencia,  // Aseguramos que tipoIncidencia no sea null
        createdBy: user,
        assignedTo: tecnicoUser,  // Puede ser null si tipoIncidencia es "Mantencion"
      });
    
      return this.ticketRepository.save(ticket);
    }
    

    // Obtenemos (FETCH)  todas los tickets de la base de datos
    async fetchTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find();
    }

    async fetchTicketById(id: number): Promise<Ticket> {
      try {
        return await this.ticketRepository.createQueryBuilder('ticket')
          .leftJoinAndSelect('ticket.assignedTo', 'assignedTo') // Asegúrate de incluir la relación
          .leftJoinAndSelect('ticket.createdBy', 'createdBy') // Incluye la relación con el creador del ticket
          .where('ticket.id = :id', { id })
          .getOne();
      } catch (error) {
        console.error('Error fetching ticket by ID:', error);
        throw new InternalServerErrorException('Error fetching ticket by ID');
      }
    }

    // Actualizar ticket
    async updateTicket(id: number, updateData: Partial<Ticket>): Promise<void> {
      const ticket = await this.ticketRepository.findOne({where: {id}});
  
      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }
  
      // Actualiza solo el campo 'estado'
      if (updateData.estado) {
        ticket.estado = updateData.estado;
      }
  
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



    //Buscamos el ticket dependiendo el rol de usuario
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

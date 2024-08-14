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
      // Asegúrate de que `tecnico` en el DTO es un número
      const { tecnico, ...ticketData } = createTicketDto;
      
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }
  
      // Buscar el técnico si se proporciona un ID
      const tecnicoUser = tecnico ? 
        await this.userRepository.findOne({ where: { id: Number(tecnico) } }) : null;
  
      const ticket = this.ticketRepository.create({
        ...ticketData,
        createdBy: user,
        assignedTo: tecnicoUser, // Asignar técnico si se proporciona
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
          .where('ticket.id = :id', { id })
          .getOne();
      } catch (error) {
        console.error('Error fetching ticket by ID:', error);
        throw new InternalServerErrorException('Error fetching ticket by ID');
      }
    }

    //Eliminar ticket de la base de datos por ID
    async removeTicket(id:string){
        const result = await this.ticketRepository.delete(id);
        if (result.affected === 0){
            throw new NotFoundException(`Ticket "${id}" no se encuentra`)
        }
        return {message: 'Ticket fue eliminado con exito.!'}
    }

    //Actualizacion de ticket por ID  con nuevos datos
    async updateTicket(id:number, updateTicketDto:UpdateTicketDto) {
        const hasTicket = await this.fetchTicketById(id);
        if (!hasTicket) throw new Error(`Ticket "${id}" no se encuentra`);
        await this.ticketRepository.update(id, updateTicketDto)
    }

    //Buscamos el ticket dependiendo el rol de usuario
    async findTickets(user: User): Promise<Ticket[]> {
        if (user.rol === 'admin') {
          return this.ticketRepository.find(); // Admin puede ver todos los tickets
        } else if (user.rol === 'user') {
          return this.ticketRepository.find({ where: { createdBy: user } }); // Usuario puede ver solo sus tickets
        } else if (user.rol === 'tecnico') {
          return this.ticketRepository.find({ where: { assignedTo: user } }); // Técnico puede ver solo los tickets asignados a él
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
      return await this.ticketRepository.createQueryBuilder('ticket')
        .where('ticket.assignedToId = :technicianId', { technicianId })
        .getMany();
    } catch (error) {
      console.error('Error fetching tickets by technician ID:', error);
      throw new InternalServerErrorException('Error fetching tickets by technician ID');
    }
  }
  


}

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
      const { tecnico, ...ticketData } = createTicketDto;
    
      // Buscar el usuario que está creando el ticket
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['establecimiento'], // Asegúrate de cargar el establecimiento relacionado
      });
    
      if (!user) {
        throw new ForbiddenException('Usuario no encontrado');
      }
    
      // Si se proporciona un técnico en el DTO, búscalo, de lo contrario, busca el técnico asignado al colegio del usuario
      let tecnicoUser;
      if (tecnico) {
        tecnicoUser = await this.userRepository.findOne({ where: { id: Number(tecnico) } });
      } else {
        tecnicoUser = await this.userRepository.findOne({
          where: {
            establecimiento: user.establecimiento,
            rol: 'tecnico',
          },
        });
    
        if (!tecnicoUser) {
          throw new ForbiddenException('No se encontró un técnico asignado para este colegio');
        }
      }
    
      // Crear el ticket con el técnico asignado
      const ticket = this.ticketRepository.create({
        ...ticketData,
        createdBy: user,
        assignedTo: tecnicoUser,
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
      const query = this.ticketRepository.createQueryBuilder('ticket');
  
      if (user.rol === 'admin') {
          return query.getMany(); // Admin puede ver todos los tickets
      } else if (user.rol === 'user') {
          return query
              .where('ticket.createdById = :userId', { userId: user.id })
              .getMany(); // Usuario puede ver solo sus tickets
      } else if (user.rol === 'tecnico') {
          return query
              .where('ticket.assignedToId = :userId', { userId: user.id })
              .getMany(); // Técnico puede ver solo los tickets asignados a él
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from './entity/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketService {

    constructor(
        @InjectRepository(Ticket)
        private ticketRepository: Repository<Ticket>,
    ){}

    // La Logica del CRUD para el tickets comienza aqui


    // Obtenemos (FETCH)  todas los tickets de la base de datos
    async fetchTickets(): Promise<Ticket[]> {
        return this.ticketRepository.find();
    }

    //Obtenemos un ticket por ID desde la base de datos
    async fetchTicketById(id:number): Promise<Ticket> {
        const found = await this.ticketRepository.findOne({ where: { id: id} });
        if (!found){
            throw new NotFoundException(`Ticket "${id}" no se encuentra`)
        }
        return found;
    }

    //Agregamos un ticket a la base de datos
    async addTicket(createTicketDto: CreateTicketDto): Promise<Ticket>{
        const { name, email, anexo } = createTicketDto;
        const ticket = this.ticketRepository.create({
          name,
          email,
          anexo
        })
        await this.ticketRepository.save(ticket);
        return ticket;
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






}

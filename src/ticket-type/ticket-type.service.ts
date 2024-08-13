import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoTicket } from './entity/tipo-ticket.entity';
import { CreateTipoTicketDto } from './dto/create-ticket-type.dto';

@Injectable()
export class TicketTypeService {

    constructor(
        @InjectRepository(TipoTicket)
        private readonly tipoTicketRepository: Repository<TipoTicket>,
    ){}

    // Creacion de establecimientos
    async createTipoTicket(createtipoTicketDto: CreateTipoTicketDto): Promise<TipoTicket> {
        const tipoTicket = this.tipoTicketRepository.create(createtipoTicketDto);
        await this.tipoTicketRepository.save(tipoTicket);
        return tipoTicket;
    }
    // Obtencion de Establecimientos
    async fetchTipoTicket(): Promise<TipoTicket[]> {
        return this.tipoTicketRepository.find();
    }
    // Obtener Establecimiento por :id
    async fetchTipoTicketById(id:number):Promise<TipoTicket> {
        const found = await this.tipoTicketRepository.findOne({ where: {id: id}});
        if (!found ){
            throw new NotFoundException(`El establecimiento "${id} no se encuentra ingresado`)
        }
        return found;
    }

}

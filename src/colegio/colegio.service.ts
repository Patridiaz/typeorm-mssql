import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Establecimiento } from './entity/colegio.entity';
import { Repository } from 'typeorm';
import { CreateEstablecimientoDto } from './dto/create-colegio.dto';

@Injectable()
export class EstablecimientoService {

    constructor(
        @InjectRepository(Establecimiento)
        private readonly establecimientoRepository: Repository<Establecimiento>,
    ){}

    // Creacion de establecimientos
    async createEstablecimiento(createEstablecimientoDto: CreateEstablecimientoDto): Promise<Establecimiento> {
        const establecimiento = this.establecimientoRepository.create(createEstablecimientoDto);
        await this.establecimientoRepository.save(establecimiento);
        return establecimiento;
    }
    // Obtencion de Establecimientos
    async fetchEstablecimientos(): Promise<Establecimiento[]> {
        return this.establecimientoRepository.find();
    }
    // Obtener Establecimiento por :id
    async fetchEstablecimientoById(id:number):Promise<Establecimiento> {
        const found = await this.establecimientoRepository.findOne({ where: {id: id}});
        if (!found ){
            throw new NotFoundException(`El establecimiento "${id} no se encuentra ingresado`)
        }
        return found;
    }












}

import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Establecimiento } from './entity/colegio.entity';
import { Repository } from 'typeorm';
import { CreateEstablecimientoDto } from './dto/create-colegio.dto';
import { UpdateEstablecimientoDto } from './dto/update-colegio';

@Injectable()
export class EstablecimientoService {

    constructor(
        @InjectRepository(Establecimiento)
        private readonly establecimientoRepository: Repository<Establecimiento>,
    ){}

    // Creacion de establecimientos
    async createEstablecimiento(createEstablecimientoDto: CreateEstablecimientoDto): Promise<Establecimiento> {
        try {
            const existingByName = await this.establecimientoRepository.findOne({
                where: { name: createEstablecimientoDto.name }
            });
        
            if (existingByName) {
                throw new BadRequestException('Ya existe un establecimiento con el mismo nombre.');
            }
        
            const existingByEmail = await this.establecimientoRepository.findOne({
                where: { email: createEstablecimientoDto.email }
            });
        
            if (existingByEmail) {
                throw new BadRequestException('Ya existe un establecimiento con el mismo correo electrónico.');
            }
        
            const establecimiento = this.establecimientoRepository.create(createEstablecimientoDto);
            await this.establecimientoRepository.save(establecimiento);
            return establecimiento;
        } catch (error) {
            console.error('Error al crear el establecimiento:', error);
            throw new InternalServerErrorException('Error al crear el establecimiento.');
        }
    }

    async updateEstablecimiento(id: number, updateEstablecimientoDto: UpdateEstablecimientoDto): Promise<Establecimiento> {
        try {
            if (updateEstablecimientoDto.name) {
                const existingByName = await this.establecimientoRepository.findOne({
                    where: { name: updateEstablecimientoDto.name },
                });
        
                if (existingByName && existingByName.id !== id) {
                    throw new BadRequestException('Ya existe un establecimiento con el mismo nombre.');
                }
            }
        
            if (updateEstablecimientoDto.email) {
                const existingByEmail = await this.establecimientoRepository.findOne({
                    where: { email: updateEstablecimientoDto.email },
                });
        
                if (existingByEmail && existingByEmail.id !== id) {
                    throw new BadRequestException('Ya existe un establecimiento con el mismo correo electrónico.');
                }
            }
        
            const establecimiento = await this.establecimientoRepository.preload({
                id: id,
                ...updateEstablecimientoDto,
            });
        
            if (!establecimiento) {
                throw new NotFoundException(`El establecimiento con ID ${id} no fue encontrado.`);
            }
        
            return this.establecimientoRepository.save(establecimiento);
        } catch (error) {
            console.error('Error al actualizar el establecimiento:', error);
            throw new InternalServerErrorException('Error al actualizar el establecimiento.');
        }
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

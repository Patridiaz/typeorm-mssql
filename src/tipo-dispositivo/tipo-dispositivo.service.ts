// src/tipo-dispositivo/tipo-dispositivo.service.ts
import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { TipoDispositivo } from './entity/tipo-dispositivo.entity';

@Injectable()
export class TipoDispositivoService {
  constructor(
    @InjectRepository(TipoDispositivo,'inventoryConnection')
    private tipoDispositivoRepository: Repository<TipoDispositivo>,
  ) {}

  findAll(): Promise<TipoDispositivo[]> {
    return this.tipoDispositivoRepository.find();
  }

  findOne(id: number): Promise<TipoDispositivo> {
    return this.tipoDispositivoRepository.findOneBy({ id });
  }

  async create(tipoDispositivo: TipoDispositivo): Promise<TipoDispositivo> {
    // Validación adicional: Asegúrate de que el tipo no exista previamente
    const existingTipo = await this.tipoDispositivoRepository.findOneBy({ tipo: tipoDispositivo.tipo });
    if (existingTipo) {
        throw new ConflictException('El tipo de dispositivo ya existe.');
    }

    return await this.tipoDispositivoRepository.save(tipoDispositivo);
  } 
  
  async update(id: number, data: Partial<TipoDispositivo>): Promise<TipoDispositivo> {
    await this.tipoDispositivoRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.tipoDispositivoRepository.delete(id);
  }
}

// src/tipo-dispositivo/tipo-dispositivo.service.ts
import { ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { MarcaDispositivo } from './entity/marca-dispositivo.entity';

@Injectable()
export class MarcaDispositivoService {
  constructor(
    @InjectRepository(MarcaDispositivo,'inventoryConnection')
    private marcaDispositivoRepository: Repository<MarcaDispositivo>,
  ) {}

  findAll(): Promise<MarcaDispositivo[]> {
    return this.marcaDispositivoRepository.find();
  }

  findOne(id: number): Promise<MarcaDispositivo> {
    return this.marcaDispositivoRepository.findOneBy({ id });
  }

  async create(marcaDispositivo: MarcaDispositivo): Promise<MarcaDispositivo> {
    // Validación adicional: Asegúrate de que el tipo no exista previamente
    const existingaMarca = await this.marcaDispositivoRepository.findOneBy({ marca: marcaDispositivo.marca });
    if (existingaMarca) {
        throw new ConflictException('El tipo de dispositivo ya existe.');
    }

    return await this.marcaDispositivoRepository.save(marcaDispositivo);
  } 
  
  async update(id: number, data: Partial<MarcaDispositivo>): Promise<MarcaDispositivo> {
    await this.marcaDispositivoRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.marcaDispositivoRepository.delete(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Bodega } from './entity/bodega.entity';
import { CreateBodegaDto } from './dto/create-bodega-item.dto';


@Injectable()
export class BodegaService {
  constructor(
    @InjectRepository(Bodega, 'inventoryConnection')
        private bodegaRepository: Repository<Bodega>,
  ) {}

  findAll(): Promise<Bodega[]> {
    return this.bodegaRepository.find();
  }

  create(dto: CreateBodegaDto): Promise<Bodega> {
    const nuevo = this.bodegaRepository.create(dto);
    return this.bodegaRepository.save(nuevo);
  }

  async actualizarCantidad(id: number, cantidad: number): Promise<Bodega> {
    const item = await this.bodegaRepository.findOneBy({ id });
    item.cantidad = cantidad;
    return this.bodegaRepository.save(item);
  }
}

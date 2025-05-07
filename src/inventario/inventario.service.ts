// src/inventory/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entity/inventario.entity';
import { CreateInventoryItemDto } from './dto/create-inventario-item.dto';
import { TipoDispositivo } from 'src/tipo-dispositivo/entity/tipo-dispositivo.entity';
import { User } from 'src/auth/entity/user.entity';
import { MarcaDispositivo } from 'src/marca-dispositivo/entity/marca-dispositivo.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem, 'inventoryConnection')
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(TipoDispositivo, 'inventoryConnection')
    private tipoDispositivoRepository:Repository<TipoDispositivo>,
    @InjectRepository(MarcaDispositivo, 'inventoryConnection')
    private marcaDispositivoRepository:Repository<MarcaDispositivo>,
    @InjectRepository(User) // Conexión principal
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<InventoryItem[]> {
    return await this.inventoryRepository.find();
  }

  async findOne(id: number): Promise<InventoryItem> {
    return await this.inventoryRepository.findOneBy({ id });
  }

  async createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const tipoDispositivo = await this.tipoDispositivoRepository.findOne({ where: { id: dto.tipoDispositivoId } });
    const marcaDispositivo = await this.marcaDispositivoRepository.findOne({ where: { id: dto.marcaDispositivoId } });
   
    if (!tipoDispositivo) {
      throw new NotFoundException('TipoDispositivo no encontrado');
    }
      // Obtener el usuario desde la base de datos principal usando `userId`
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
  
    const inventoryItem = this.inventoryRepository.create({
      ...dto,
      tipoDispositivo,
      marcaDispositivo,
      userId: user.id,
    });
  
    return await this.inventoryRepository.save(inventoryItem);
  }
  
  async findAllByUserId(userId: number): Promise<InventoryItem[]> {
    return await this.inventoryRepository.find({
      where: { userId }, // Filtrar solo los items asignados al usuario
    });
  }
  

  async update(id: number, item: Partial<InventoryItem>): Promise<void> {
    await this.inventoryRepository.update(id, item);
  }

  async remove(id: number): Promise<void> {
    await this.inventoryRepository.delete(id);
  }
}

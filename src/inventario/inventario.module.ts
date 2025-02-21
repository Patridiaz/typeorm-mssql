// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entity/inventario.entity';
import { InventoryService } from './inventario.service';
import { InventoryController } from './inventario.controller';
import { TipoDispositivo } from 'src/tipo-dispositivo/entity/tipo-dispositivo.entity';
import { User } from 'src/auth/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem,TipoDispositivo], 'inventoryConnection'), // Usa la conexión de inventario
    AuthModule
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}

// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entity/inventario.entity';
import { InventoryService } from './inventario.service';
import { InventoryController } from './inventario.controller';
import { TipoDispositivo } from 'src/tipo-dispositivo/entity/tipo-dispositivo.entity';
import { User } from 'src/auth/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MarcaDispositivo } from 'src/marca-dispositivo/entity/marca-dispositivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem,TipoDispositivo,MarcaDispositivo], 'inventoryConnection'), // Usa la conexión de inventario
    AuthModule
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}

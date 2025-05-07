// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDispositivo } from 'src/tipo-dispositivo/entity/tipo-dispositivo.entity';
import { User } from 'src/auth/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MarcaDispositivo } from 'src/marca-dispositivo/entity/marca-dispositivo.entity';
import { Bodega } from './entity/bodega.entity';
import { BodegaService } from './bodega.service';
import { BodegaController } from './bodega.controller';
import { InventoryItem } from 'src/inventario/entity/inventario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem,Bodega,TipoDispositivo,MarcaDispositivo], 'inventoryConnection'), // Usa la conexión de inventario
    AuthModule
  ],
  providers: [BodegaService],
  controllers: [BodegaController],
  exports: [BodegaService],
})
export class BodegaModule {}

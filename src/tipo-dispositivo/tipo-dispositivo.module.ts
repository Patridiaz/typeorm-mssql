// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDispositivo } from './entity/tipo-dispositivo.entity';
import { TipoDispositivoController } from './tipo-dispositivo.controller';
import { TipoDispositivoService } from './tipo-dispositivo.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([TipoDispositivo], 'inventoryConnection'), // Usa la conexión de inventario
  ],
  providers: [TipoDispositivoService],
  controllers: [TipoDispositivoController],
})
export class TipoDispositivoModule {}

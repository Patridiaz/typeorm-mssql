// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcaDispositivo } from './entity/marca-dispositivo.entity';
import { MarcaDispositivoController } from './marca-dispositivo.controller';
import { MarcaDispositivoService } from './marca-dispositivo.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([MarcaDispositivo], 'inventoryConnection'), // Usa la conexión de inventario
  ],
  providers: [MarcaDispositivoService],
  controllers: [MarcaDispositivoController],
})
export class MarcaDispositivoModule {}

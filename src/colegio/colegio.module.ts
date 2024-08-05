import { Module } from '@nestjs/common';
import { EstablecimientoService } from './colegio.service';
import { EstablecimientoController } from './colegio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Establecimiento } from './entity/colegio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Establecimiento])],
  providers: [EstablecimientoService],
  controllers: [EstablecimientoController]
})
export class EstablecimientoModule {}

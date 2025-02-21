// src/tipo-dispositivo/tipo-dispositivo.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TipoDispositivoService } from './tipo-dispositivo.service';
import { TipoDispositivo } from './entity/tipo-dispositivo.entity';

@Controller('dispositivo')
export class TipoDispositivoController {
  constructor(private readonly tipoDispositivoService: TipoDispositivoService) {}

  @Get()
  findAll() {
    return this.tipoDispositivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tipoDispositivoService.findOne(id);
  }

  @Post()
  create(@Body() tipoDispositivo: TipoDispositivo) {
    return this.tipoDispositivoService.create(tipoDispositivo);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<TipoDispositivo>) {
    return this.tipoDispositivoService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoDispositivoService.remove(+id);
  }
}

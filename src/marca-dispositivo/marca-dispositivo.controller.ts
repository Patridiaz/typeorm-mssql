// src/tipo-dispositivo/tipo-dispositivo.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MarcaDispositivo } from './entity/marca-dispositivo.entity';
import { MarcaDispositivoService } from './marca-dispositivo.service';

@Controller('marca')
export class MarcaDispositivoController {
  constructor(private readonly marcaDispositivoService: MarcaDispositivoService) {}

  @Get()
  findAll() {
    return this.marcaDispositivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.marcaDispositivoService.findOne(id);
  }

  @Post()
  create(@Body() marcaDispositivo: MarcaDispositivo) {
    return this.marcaDispositivoService.create(marcaDispositivo);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<MarcaDispositivo>) {
    return this.marcaDispositivoService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcaDispositivoService.remove(+id);
  }
}

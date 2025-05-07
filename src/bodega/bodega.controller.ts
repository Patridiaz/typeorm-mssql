// src/inventory/inventory.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { BodegaService } from './bodega.service';
import { CreateBodegaDto } from './dto/create-bodega-item.dto';
import { Bodega } from './entity/bodega.entity';

@Controller('bodega')
export class BodegaController {
  constructor(private readonly bodegaService: BodegaService) {}

  @Get()
  getAll(): Promise<Bodega[]> {
    return this.bodegaService.findAll();
  }

  @Post()
  create(@Body() dto: CreateBodegaDto) {
    return this.bodegaService.create(dto);
  }

  @Patch(':id/cantidad')
  updateCantidad(@Param('id') id: number, @Body('cantidad') cantidad: number) {
    return this.bodegaService.actualizarCantidad(id, cantidad);
  }
}

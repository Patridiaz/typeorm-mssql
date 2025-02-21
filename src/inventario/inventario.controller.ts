// src/inventory/inventory.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventario.service';
import { InventoryItem } from './entity/inventario.entity';
import { CreateInventoryItemDto } from './dto/create-inventario-item.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(): Promise<InventoryItem[]> {
    return this.inventoryService.findAll();
  }

  @Get('user/:userId')
  async findAllByUserId(@Param('userId') userId: number): Promise<InventoryItem[]> {
    return this.inventoryService.findAllByUserId(userId);
  }

  

  @Post()
  async create(@Body() createInventoryDto: CreateInventoryItemDto) {
    const inventoryItem = await this.inventoryService.createInventoryItem(createInventoryDto);
    return inventoryItem;  // Esto debería retornar un solo InventoryItem
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() item: Partial<InventoryItem>): Promise<void> {
    await this.inventoryService.update(id, item);
  }


  // @Delete(':id')
  // async remove(@Param('id') id: number): Promise<void> {
  //   await this.inventoryService.remove(id);
  // }
}

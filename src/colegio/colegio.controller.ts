import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EstablecimientoService } from './colegio.service';
import { CreateEstablecimientoDto } from './dto/create-colegio.dto';
import { Establecimiento } from './entity/colegio.entity';
import { UpdateEstablecimientoDto } from './dto/update-colegio';

@Controller('establecimiento')
export class EstablecimientoController {

    constructor(private readonly establecimientoService: EstablecimientoService){}


    // Creación de establecimiento
    @Post()
    async createEstablecimiento(@Body() createEstablecimientoDto:CreateEstablecimientoDto) {
        return this.establecimientoService.createEstablecimiento(createEstablecimientoDto)
    }

    // Obtenemos todos los establecimientos
    @Get()
    getEstablecimientos(){
        return this.establecimientoService.fetchEstablecimientos();
    }

    // Obtenemos establecimiento por ID
    @Get(':id')
    getEstablecimientoById(@Param('id') id: number ): Promise<Establecimiento> {
        return this.establecimientoService.fetchEstablecimientoById(id)
    }

    @Put(':id')
    async updateEstablecimiento(
      @Param('id') id: number,
      @Body() updateEstablecimientoDto: UpdateEstablecimientoDto,
    ): Promise<Establecimiento> {
      return this.establecimientoService.updateEstablecimiento(id, updateEstablecimientoDto);
    }

    

}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EstablecimientoService } from './colegio.service';
import { CreateEstablecimientoDto } from './dto/create-colegio.dto';
import { Establecimiento } from './entity/colegio.entity';

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

    

}

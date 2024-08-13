
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoTicket } from './entity/tipo-ticket.entity';
import { TicketTypeService } from './ticket-type.service';
import { TipoTicketController } from './ticket-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TipoTicket])],
  providers: [TicketTypeService],
  controllers: [TipoTicketController]
})
export class TicketTypeModule {}

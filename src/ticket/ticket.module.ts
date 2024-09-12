import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entity/ticket.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entity/user.entity';
import { TipoTicket } from 'src/ticket-type/entity/tipo-ticket.entity';
import { MailService } from 'src/auth/mail.service';

@Module({
  imports:[TypeOrmModule.forFeature([Ticket,User,TipoTicket,MailService]),
  AuthModule
],
  providers: [TicketService],
  controllers: [TicketController]
})
export class TicketModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from './ticket/ticket.module';
import { Ticket } from './ticket/entity/ticket.entity';
import { AuthModule } from './auth/auth/auth.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: '10.10.59.14',
      port: 1432,
      username: 'sa',
      password: 'root',
      database: 'ticket-service',
      options: {
        encrypt: false, // MSSQL-specific option
        trustServerCertificate: true,
      },
      synchronize: true, //use this with development environment
      entities: [Ticket],
    }),
    TicketModule,
    AuthModule,
  ],
})
export class AppModule {}

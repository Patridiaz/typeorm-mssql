import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from './ticket/ticket.module';
import { Ticket } from './ticket/entity/ticket.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entity/user.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [

    ConfigModule.forRoot(),
    
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
      entities: [Ticket,User],
    }),
    TypeOrmModule.forFeature([User]),
    TicketModule,
    AuthModule,
  ],
  controllers:[AuthController],
  providers:[AuthService]
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from './ticket/ticket.module';
import { Ticket } from './ticket/entity/ticket.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entity/user.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { EstablecimientoModule } from './colegio/colegio.module';
import { Establecimiento } from './colegio/entity/colegio.entity';

@Module({
  imports: [

    ConfigModule.forRoot(),
    
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      synchronize: true,
      entities: [Ticket, User, Establecimiento],
    }),
    TypeOrmModule.forFeature([User]),
    TicketModule,
    AuthModule,
    EstablecimientoModule,
  ],
  controllers:[AuthController],
  providers:[AuthService]
})
export class AppModule {}

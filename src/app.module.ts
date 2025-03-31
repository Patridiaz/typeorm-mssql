import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
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
import { TicketTypeModule } from './ticket-type/ticket-type.module';
import { TipoTicket } from './ticket-type/entity/tipo-ticket.entity';
import { RecoveryToken } from './auth/entity/recovery-token.entity';
import { MailService } from './auth/mail.service';
import { RolUserModule } from './rol-user/rol-user.module';
import { InventoryItem } from './inventario/entity/inventario.entity';
import { InventoryModule } from './inventario/inventario.module';
import { TipoDispositivo } from './tipo-dispositivo/entity/tipo-dispositivo.entity';
import { TipoDispositivoModule } from './tipo-dispositivo/tipo-dispositivo.module';
import { FileEntity } from './ticket/entity/fileTicket.entity';

@Module({
  imports: [

    ConfigModule.forRoot(),
    
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 1432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      synchronize: true,
      entities: [Ticket, User, Establecimiento, TipoTicket,RecoveryToken,FileEntity],
    }),

    // Segunda conexión (para inventario)
    TypeOrmModule.forRoot({
      name: 'inventoryConnection', // nombre de conexión único
      type: 'mssql',
      host: process.env.INVENTORY_DB_HOST || process.env.DB_HOST,
      port: parseInt(process.env.INVENTORY_DB_PORT, 10) || 1432,
      username: process.env.INVENTORY_DB_USER || process.env.DB_USER,
      password: process.env.INVENTORY_DB_PASS || process.env.DB_PASS,
      database: process.env.INVENTORY_DB_NAME || process.env.DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      synchronize: true,
      entities: [InventoryItem,TipoDispositivo], // solo entidades de inventario
    }),

    TypeOrmModule.forFeature([User,RecoveryToken]),
    TicketModule,
    AuthModule,
    EstablecimientoModule,
    TicketTypeModule,
    RolUserModule,
    InventoryModule,
    TipoDispositivoModule, // módulo de inventario   
  ],
  controllers:[AuthController],
  providers:[AuthService,MailService ]
})
export class AppModule {
}

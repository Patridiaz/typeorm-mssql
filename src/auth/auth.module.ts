import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RecoveryToken } from './entity/recovery-token.entity';
import { MailService } from './mail.service';
import { Establecimiento } from 'src/colegio/entity/colegio.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, RecoveryToken,Establecimiento]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
    AuthModule
  
  ],
  providers: [AuthService, MailService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule], // Exporta AuthService para que otros módulos puedan usarlo
})
export class AuthModule {}

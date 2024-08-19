import { Module } from '@nestjs/common';
import { RolUserService } from './rol-user.service';
import { RolUserController } from './rol-user.controller';

@Module({
  providers: [RolUserService],
  controllers: [RolUserController]
})
export class RolUserModule {}

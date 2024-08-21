import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({});
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true,
      transform: true
    }));

    

    const port = (parseInt(process.env.PORT) || 4000); // Usa el puerto de la variable de entorno o el predeterminado 3000
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);

  

}
bootstrap();

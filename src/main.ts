import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config(); // Cargar variables de entorno desde .env

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configuración para servir archivos estáticos desde la carpeta 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', // Prefix para acceder a los archivos
  });

  app.enableCors({});
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true,
      transform: true
    }));

    

    const port = process.env.PORT || 4100; // Usa el puerto de la variable de entorno o el predeterminado 3000
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);

  

}
bootstrap();

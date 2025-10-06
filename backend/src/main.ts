import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express'; // ✅ مهم جدًا

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

app.useStaticAssets(join(__dirname, '..', 'public'), {
  prefix: '/static/',
});
console.log('🟢 [BACKEND] Static files served from:', join(__dirname, '..', 'public'));




  await app.listen(3001);
  console.log('Server running on http://localhost:3001');
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './seeder/seeder.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const seederService = app.get(SeederService);
  await seederService.seed();

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

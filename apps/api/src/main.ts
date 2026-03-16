import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, 
  });
  app.useLogger(app.get(Logger));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);
  app.get(Logger).log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();

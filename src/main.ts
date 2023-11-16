import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const loggerLevel: string = configService.get<string>(
    'appConfig.loggerLevel',
  );

  app.useLogger([loggerLevel as LogLevel]);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.use(helmet());

  const host = configService.get<string>('appConfig.host', 'localhost');
  const port = configService.get<number>('appConfig.port', 8082);

  const config = new DocumentBuilder()
    .setTitle('nest-ip-tracker')
    .setDescription('IP Tracker - RESTful API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(port, host, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });
}

bootstrap();

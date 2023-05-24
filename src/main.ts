import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { AllExceptionFilter } from './shared/filter/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  app.enableCors();

  app.useLogger(app.get(LoggerService));

  /**
   * Apply validation for all inputs globally
   */
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * Strip away all none-object existing properties
       */
      whitelist: true,
      /***
       * Transform input objects to their corresponding DTO objects
       */
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Symon Point Wallet APIs')
    .setDescription('Symon Point Wallet APIs Service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalFilters(new AllExceptionFilter(new LoggerService()))

  await app.listen(process.env.PORT || 3001);
  Logger.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();

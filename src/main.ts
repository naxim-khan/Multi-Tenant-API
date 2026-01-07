import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api');

  // Security
  app.enableCors();
  app.use(helmet());
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useLogger(app.get(Logger));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant SaaS API')
    .setDescription('Professional SaaS backend with RBAC and Multi-Tenancy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Clean startup message
  console.log('\n🚀 Server is running!');
  console.log(`📍 Local:            http://localhost:${port}/api`);
  console.log(`🌍 Network:          http://0.0.0.0:${port}/api`);
  console.log(`📚 Environment:      ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at:       ${new Date().toLocaleString()}\n`);
}
bootstrap();

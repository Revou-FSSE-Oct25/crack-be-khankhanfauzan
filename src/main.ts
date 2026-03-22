import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction, RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const helmetMw: RequestHandler = (
    helmet as unknown as () => RequestHandler
  )();
  const compressionMw: RequestHandler = (
    compression as unknown as () => RequestHandler
  )();
  const morganMw: RequestHandler = (
    morgan as unknown as (format: string) => RequestHandler
  )('combined');
  const rateLimiterMw: RequestHandler = (
    rateLimit as unknown as (opts: unknown) => RequestHandler
  )({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(helmetMw);
  app.use(compressionMw);
  app.use(morganMw);
  app.use(rateLimiterMw);
  app.use(
    (
      req: Request & { requestId?: string },
      res: Response,
      next: NextFunction,
    ) => {
      const id = uuidv4();
      req.requestId = id;
      res.setHeader('X-Request-ID', id);
      next();
    },
  );
  app.enableCors();

  app.setGlobalPrefix('api/v1');

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('RevoU CRACK BE API')
    .setDescription(
      'API documentation for RevoU CRACK BE Project - Emerald House by Fauzan Akbar Khan',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app as any, config);
  SwaggerModule.setup('api', app as any, document);

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

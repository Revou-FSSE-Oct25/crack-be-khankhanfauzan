import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction, RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const helmetGlobal: RequestHandler = (
    helmet as unknown as () => RequestHandler
  )();
  const helmetSwagger: RequestHandler = (
    helmet as unknown as (opts: unknown) => RequestHandler
  )({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  const compressionMw: RequestHandler = (
    compression as unknown as () => RequestHandler
  )();

  app.use(helmetGlobal);
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    next();
  });
  app.use('/api', helmetSwagger);
  app.use(compressionMw);

  app.enableCors();

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

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
    .addBearerAuth()
    .build();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const document = SwaggerModule.createDocument(app as any, config);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  SwaggerModule.setup('api', app as any, document);

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}
void bootstrap();

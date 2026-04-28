import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import morgan from 'morgan';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly morganInstance = (
    morgan as unknown as (format: string) => RequestHandler
  )('combined');

  use(req: Request, res: Response, next: NextFunction) {
    this.morganInstance(req, res, next);
  }
}

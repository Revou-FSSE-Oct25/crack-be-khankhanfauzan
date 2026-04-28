import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestTrackingMiddleware implements NestMiddleware {
  use(
    req: Request & { requestId?: string },
    res: Response,
    next: NextFunction,
  ) {
    const id = uuidv4();
    req.requestId = id;
    res.setHeader('X-Request-ID', id);
    next();
  }
}

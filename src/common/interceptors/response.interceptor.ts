import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from 'src/types/api-response.interface';
import { Response } from 'express';
import { Request } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    return next.handle().pipe(
      map((data: T) => {
        const status: number = res.statusCode ?? HttpStatus.OK;
        const url: string = (req.originalUrl || req.url) ?? '';
        const isSwagger =
          url === '/api-json' ||
          (url.startsWith('/api') && !url.startsWith('/api/v1'));
        if (isSwagger || typeof data === 'string') {
          return data as unknown as ApiResponse<T>;
        }
        const payload = data as unknown as Record<string, unknown>;
        if (
          payload &&
          typeof payload === 'object' &&
          'status' in payload &&
          'message' in payload
        ) {
          return payload as unknown as ApiResponse<T>;
        }
        return { status, message: 'Success', data } as ApiResponse<T>;
      }),
    );
  }
}

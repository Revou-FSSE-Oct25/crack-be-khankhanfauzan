import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from 'src/rooms/types/api-response.interface';
import { Response } from 'express';

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
    return next.handle().pipe(
      map((data: T) => {
        const status: number = res.statusCode ?? HttpStatus.OK;
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

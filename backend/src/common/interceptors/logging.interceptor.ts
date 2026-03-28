import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const path = req.originalUrl ?? req.url;
    const started = Date.now();

    this.logger.log(`→ ${method} ${path}`);

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`← ${method} ${path} ${Date.now() - started}ms`);
        },
        error: () => {
          this.logger.warn(
            `✗ ${method} ${path} ${Date.now() - started}ms (error)`,
          );
        },
      }),
    );
  }
}

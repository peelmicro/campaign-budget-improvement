import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    // Get the generated correlation ID from CLS
    const correlationId = this.cls.getId() || this.cls.get('reqId');

    const now = Date.now();
    this.logger.log(`[Request Started] ${method} ${url} - CorrelationID: ${correlationId}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - now;
          this.logger.log(
            `[Request Success] ${method} ${url} ${res.statusCode} - Duration: ${duration}ms - CorrelationID: ${correlationId}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `[Request Failed] ${method} ${url} - Error: ${error.message} - Duration: ${duration}ms - CorrelationID: ${correlationId}`,
            error.stack,
          );
        },
      }),
    );
  }
}

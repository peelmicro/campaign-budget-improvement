import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly cls: ClsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = this.cls.get('reqId');

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // We do NOT want to expose internal server error stack traces to the client.
    // If it's a 500, we mask the message.
    let message = 'Internal Server Error';
    if (exception instanceof HttpException) {
      const responseData = exception.getResponse();
      message =
        typeof responseData === 'object' && responseData !== null
          ? (responseData as any).message || exception.message
          : exception.message;
    }

    // Always log the actual stack trace and the exact error locally with the correlation ID
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${
        exception instanceof Error ? exception.message : 'Unknown Error'
      }`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      correlationId, // Attach tracking ID directly to the error response
    });
  }
}

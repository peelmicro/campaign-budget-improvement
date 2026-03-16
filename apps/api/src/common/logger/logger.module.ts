import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    // Async Local Storage for Correlation IDs
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('reqId', randomUUID());
        },
      },
    }),
    
    // Structured JSON Logging using Pino
    PinoLoggerModule.forRootAsync({
      inject: [],
      useFactory: () => {
        return {
          pinoHttp: {
            // Include Correlation ID in every log statement
            autoLogging: false, // We will use our explicit LoggingInterceptor instead
            customProps: (req, res) => {
              // The correlation ID is fetched automatically if mapped, but we can also use reqId explicitly
              return {
                correlationId: req['reqId'],
              };
            },
            // Pretty print logs in development
            transport:
              process.env['NODE_ENV'] !== 'production'
                ? { target: 'pino-pretty', options: { colorize: true } }
                : undefined,
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}

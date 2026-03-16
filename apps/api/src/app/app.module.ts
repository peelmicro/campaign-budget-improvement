import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrencyModule } from '../currency/currency.module';
import { ChannelModule } from '../channel/channel.module';
import { ClientModule } from '../client/client.module';
import { CampaignModule } from '../campaign/campaign.module';
import { DistributionModule } from '../distribution/distribution.module';
import { SeedModule } from '../seed/seed.module';
import { AppLoggerModule } from '../common/logger/logger.module';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from '../common/filters/http-exception.filter';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    AppLoggerModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env['DB_HOST'] || 'localhost',
      port: Number(process.env['DB_PORT']) || 3306,
      username: process.env['DB_USER'] || 'root',
      password: process.env['DB_PASSWORD'] || 'root',
      database: process.env['DB_NAME'] || 'campaign_budget_interview',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientModule,
    CurrencyModule,
    ChannelModule,
    CampaignModule,
    DistributionModule,
    SeedModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}

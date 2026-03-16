import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './currency.entity';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { HttpModule } from '@nestjs/axios';
import { ExchangeRateService } from './exchange-rate.service';

@Module({
  imports: [TypeOrmModule.forFeature([Currency]), HttpModule],
  controllers: [CurrencyController],
  providers: [CurrencyService, ExchangeRateService],
  exports: [CurrencyService, ExchangeRateService],
})
export class CurrencyModule {}

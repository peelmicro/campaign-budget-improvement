import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Currency } from './currency.entity';
import { ExchangeRateService } from './exchange-rate.service';

@Controller('currencies')
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  @Get()
  findAll(): Promise<Currency[]> {
    return this.currencyService.findAll();
  }

  @Get('rates/:base')
  getRates(@Param('base') base: string): Promise<Record<string, number>> {
    return this.exchangeRateService.getLatestRates(base.toUpperCase());
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<Currency> {
    return this.currencyService.findByCode(code.toUpperCase());
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Currency> {
    return this.currencyService.findOne(id);
  }
}

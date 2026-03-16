import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError } from 'rxjs/operators';
import { firstValueFrom, of } from 'rxjs';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly apiUrl = 'https://api.frankfurter.app/latest';

  constructor(private readonly httpService: HttpService) {}

  async getLatestRates(baseCurrency: string): Promise<Record<string, number>> {
    this.logger.log(`Fetching latest exchange rates for base: ${baseCurrency}`);

    const url = `${this.apiUrl}?from=${baseCurrency}`;

    return firstValueFrom(
      this.httpService.get(url).pipe(
        map((response) => response.data.rates),
        catchError((error) => {
          this.logger.error(`Failed to fetch exchange rates: ${error.message}`, error.stack);
          // Fallback to empty rates if the 3rd party API is down or unavailable
          return of({});
        }),
      ),
    );
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateService } from './exchange-rate.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosResponse } from 'axios';

describe('ExchangeRateService', () => {
  let service: ExchangeRateService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateService,
        {
          provide: HttpService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeRateService>(ExchangeRateService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLatestRates', () => {
    it('should successfully fetch rates from 3rd party API', async () => {
      const mockRates = { EUR: 0.85, GBP: 0.75 };
      const axiosResponse: AxiosResponse = {
        data: { rates: mockRates },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as never },
      };

      vi.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.getLatestRates('USD');

      expect(result).toEqual(mockRates);
      expect(httpService.get).toHaveBeenCalledWith('https://api.frankfurter.app/latest?from=USD');
    });

    it('should handle API errors and return an empty array fallback', async () => {
      vi.spyOn(httpService, 'get').mockReturnValue(throwError(() => new Error('API Down')));

      const result = await service.getLatestRates('USD');

      expect(result).toEqual({});
      expect(httpService.get).toHaveBeenCalledWith('https://api.frankfurter.app/latest?from=USD');
    });
  });
});

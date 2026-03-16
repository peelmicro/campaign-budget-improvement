import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { Currency } from './currency.entity';
import { ExchangeRateService } from './exchange-rate.service';

const mockCurrencies: Currency[] = [
  {
    id: 1,
    code: 'USD',
    isoNumber: '840',
    symbol: '$',
    decimalPoints: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    code: 'EUR',
    isoNumber: '978',
    symbol: '€',
    decimalPoints: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCurrencyService = {
  findAll: vi.fn().mockResolvedValue(mockCurrencies),
  findOne: vi.fn(),
  findByCode: vi.fn(),
};

const mockExchangeRateService = {
  getLatestRates: vi.fn(),
};

describe('CurrencyController', () => {
  let controller: CurrencyController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencyController],
      providers: [
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: ExchangeRateService, useValue: mockExchangeRateService },
      ],
    }).compile();

    controller = module.get<CurrencyController>(CurrencyController);
  });

  describe('findAll', () => {
    it('should return an array of currencies', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockCurrencies);
      expect(mockCurrencyService.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a single currency', async () => {
      mockCurrencyService.findOne.mockResolvedValue(mockCurrencies[0]);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockCurrencies[0]);
      expect(mockCurrencyService.findOne).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      mockCurrencyService.findOne.mockRejectedValue(
        new NotFoundException('Currency with ID 999 not found'),
      );
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a currency by code (case-insensitive)', async () => {
      mockCurrencyService.findByCode.mockResolvedValue(mockCurrencies[0]);
      const result = await controller.findByCode('usd');
      expect(result).toEqual(mockCurrencies[0]);
      expect(mockCurrencyService.findByCode).toHaveBeenCalledWith('USD');
    });

    it('should propagate NotFoundException for unknown code', async () => {
      mockCurrencyService.findByCode.mockRejectedValue(
        new NotFoundException('Currency with code XYZ not found'),
      );
      await expect(controller.findByCode('XYZ')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRates', () => {
    it('should return live exchange rates for a given base currency', async () => {
      const mockRates = { EUR: 0.85, GBP: 0.75 };
      mockExchangeRateService.getLatestRates.mockResolvedValue(mockRates);

      const result = await controller.getRates('usd');

      expect(result).toEqual(mockRates);
      expect(mockExchangeRateService.getLatestRates).toHaveBeenCalledWith('USD');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Currency } from './currency.entity';

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

const mockRepository = {
  find: vi.fn().mockResolvedValue(mockCurrencies),
  findOneBy: vi.fn(),
};

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        { provide: getRepositoryToken(Currency), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  describe('findAll', () => {
    it('should return an array of currencies', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockCurrencies);
      expect(mockRepository.find).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a currency by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCurrencies[0]);
      const result = await service.findOne(1);
      expect(result).toEqual(mockCurrencies[0]);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when currency not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a currency by code', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCurrencies[0]);
      const result = await service.findByCode('USD');
      expect(result).toEqual(mockCurrencies[0]);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ code: 'USD' });
    });

    it('should throw NotFoundException when code not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findByCode('XYZ')).rejects.toThrow(NotFoundException);
    });
  });
});

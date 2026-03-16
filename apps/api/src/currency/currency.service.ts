import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  findAll(): Promise<Currency[]> {
    return this.currencyRepository.find();
  }

  async findOne(id: number): Promise<Currency> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`);
    }
    return currency;
  }

  async findByCode(code: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOneBy({ code });
    if (!currency) {
      throw new NotFoundException(`Currency with code ${code} not found`);
    }
    return currency;
  }
}

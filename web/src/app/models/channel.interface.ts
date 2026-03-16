import { Currency } from './currency.interface';

export interface Channel {
  id: number;
  code: string;
  description: string;
  cpm: number;
  currencyId: number;
  currency: Currency;
  engagementRank: 'HIGH' | 'MEDIUM' | 'LOW';
}

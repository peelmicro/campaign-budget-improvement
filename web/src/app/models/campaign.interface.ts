import { CampaignChannel } from './campaign-channel.interface';
import { Currency } from './currency.interface';
import { Client } from './client.interface';

export type CampaignGoal = 'REACH' | 'ENGAGEMENT' | 'BALANCED';

export interface Campaign {
  id: number;
  code: string;
  clientId: number;
  client: Client;
  managerName: string;
  budget: number;
  currencyId: number;
  currency: Currency;
  days: number;
  fromDate: string;
  toDate: string;
  goal: CampaignGoal;
  channels: CampaignChannel[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignDto {
  code: string;
  clientId: number;
  managerName: string;
  budget: number;
  currencyId: number;
  days: number;
  fromDate: string;
  toDate: string;
  goal: CampaignGoal;
}

import { Channel } from './channel.interface';
import { Currency } from './currency.interface';

export interface CampaignChannel {
  id: number;
  campaignId: number;
  channelId: number;
  channel: Channel;
  allocatedBudget: number;
  currencyId: number;
  currency: Currency;
  estimatedImpressions: number;
  estimatedReach: number;
  days: number;
  schedule: string[];
}

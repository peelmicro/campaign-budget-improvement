import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../currency/currency.entity';
import { Channel } from '../channel/channel.entity';
import { EngagementRank } from '../channel/engagement-rank.enum';
import { CampaignService } from '../campaign/campaign.service';
import { Campaign } from '../campaign/campaign.entity';
import { CampaignGoal } from '../campaign/campaign-goal.enum';
import { Client } from '../client/client.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly campaignService: CampaignService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedCurrencies();
    await this.seedChannels();
    await this.seedClients();
    await this.seedCampaigns();
  }

  private async seedCurrencies(): Promise<void> {
    const count = await this.currencyRepository.count();
    if (count > 0) {
      this.logger.log('Currencies already seeded, skipping.');
      return;
    }

    const currencies: Partial<Currency>[] = [
      { code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2 },
      { code: 'EUR', isoNumber: '978', symbol: '€', decimalPoints: 2 },
      { code: 'GBP', isoNumber: '826', symbol: '£', decimalPoints: 2 },
    ];

    await this.currencyRepository.save(currencies);
    this.logger.log(`Seeded ${currencies.length} currencies.`);
  }

  private async seedChannels(): Promise<void> {
    const count = await this.channelRepository.count();
    if (count > 0) {
      this.logger.log('Channels already seeded, skipping.');
      return;
    }

    const usd = await this.currencyRepository.findOneBy({ code: 'USD' });
    if (!usd) {
      this.logger.warn('USD currency not found, skipping channel seed.');
      return;
    }

    const channels: Partial<Channel>[] = [
      {
        code: 'VIDEO',
        description: 'Video Ads',
        cpm: 15.0,
        currencyId: usd.id,
        engagementRank: EngagementRank.HIGH,
      },
      {
        code: 'DISPLAY',
        description: 'Display Ads',
        cpm: 10.0,
        currencyId: usd.id,
        engagementRank: EngagementRank.MEDIUM,
      },
      {
        code: 'SOCIAL',
        description: 'Social Media Ads',
        cpm: 3.0,
        currencyId: usd.id,
        engagementRank: EngagementRank.LOW,
      },
    ];

    await this.channelRepository.save(channels);
    this.logger.log(`Seeded ${channels.length} channels.`);
  }

  private async seedClients(): Promise<void> {
    const count = await this.clientRepository.count();
    if (count > 0) {
      this.logger.log('Clients already seeded, skipping.');
      return;
    }

    const clients: Partial<Client>[] = [
      { name: 'Acme Corp', industry: 'Retail' },
      { name: 'Globex Inc', industry: 'Technology' },
      { name: 'Initech Ltd', industry: 'Software' },
    ];

    await this.clientRepository.save(clients);
    this.logger.log(`Seeded ${clients.length} clients.`);
  }

  private async seedCampaigns(): Promise<void> {
    const count = await this.campaignRepository.count();
    if (count > 0) {
      this.logger.log('Campaigns already seeded, skipping.');
      return;
    }

    const usd = await this.currencyRepository.findOneBy({ code: 'USD' });
    const eur = await this.currencyRepository.findOneBy({ code: 'EUR' });
    
    // Fetch seeded clients
    const acme = await this.clientRepository.findOneBy({ name: 'Acme Corp' });
    const globex = await this.clientRepository.findOneBy({ name: 'Globex Inc' });
    const initech = await this.clientRepository.findOneBy({ name: 'Initech Ltd' });

    if (!usd || !eur || !acme || !globex || !initech) {
      this.logger.warn('Currencies or Clients not found, skipping campaign seed.');
      return;
    }

    const campaigns = [
      {
        code: 'SUMMER-2026',
        clientId: acme.id,
        managerName: 'Alice Johnson',
        budget: 50000,
        currencyId: usd.id,
        days: 30,
        fromDate: '2026-06-01',
        toDate: '2026-06-30',
        goal: CampaignGoal.REACH,
      },
      {
        code: 'LAUNCH-Q3',
        clientId: globex.id,
        managerName: 'Bob Smith',
        budget: 120000,
        currencyId: eur.id,
        days: 14,
        fromDate: '2026-07-01',
        toDate: '2026-07-14',
        goal: CampaignGoal.ENGAGEMENT,
      },
      {
        code: 'BRAND-AWARENESS',
        clientId: initech.id,
        managerName: 'Carol Davis',
        budget: 75000,
        currencyId: usd.id,
        days: 21,
        fromDate: '2026-08-01',
        toDate: '2026-08-21',
        goal: CampaignGoal.BALANCED,
      },
    ];

    for (const dto of campaigns) {
      await this.campaignService.create(dto);
    }
    this.logger.log(`Seeded ${campaigns.length} demo campaigns.`);
  }
}

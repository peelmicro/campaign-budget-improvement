import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from '../currency/currency.entity';
import { Channel } from '../channel/channel.entity';
import { Campaign } from '../campaign/campaign.entity';
import { Client } from '../client/client.entity';
import { CampaignModule } from '../campaign/campaign.module';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Currency, Channel, Campaign, Client]),
    CampaignModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}

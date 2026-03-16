import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { CampaignChannel } from './campaign-channel.entity';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { DistributionModule } from '../distribution/distribution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, CampaignChannel]),
    DistributionModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}

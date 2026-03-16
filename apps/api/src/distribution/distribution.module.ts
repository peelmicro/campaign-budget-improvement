import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../channel/channel.entity';
import { CampaignChannel } from '../campaign/campaign-channel.entity';
import { DistributionService } from './distribution.service';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, CampaignChannel])],
  providers: [DistributionService],
  exports: [DistributionService],
})
export class DistributionModule {}

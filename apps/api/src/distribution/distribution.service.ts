import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Channel } from '../channel/channel.entity';
import { CampaignChannel } from '../campaign/campaign-channel.entity';
import { Campaign } from '../campaign/campaign.entity';
import { CampaignGoal } from '../campaign/campaign-goal.enum';
import { FREQUENCY_CAP } from './constants';

@Injectable()
export class DistributionService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(CampaignChannel)
    private readonly campaignChannelRepository: Repository<CampaignChannel>,
  ) {}

  async distribute(
    campaign: Campaign,
    transactionManager?: EntityManager,
  ): Promise<CampaignChannel[]> {
    const channels = await this.channelRepository.find();
    const decimalPoints = campaign.currency?.decimalPoints ?? 2;
    const budget = Number(campaign.budget);

    const weights = this.calculateWeights(channels, campaign.goal);
    const schedule = this.generateDateRange(campaign.fromDate, campaign.toDate);

    const allocations = channels.map((channel, index) => {
      const allocatedBudget = this.round(
        budget * weights[index],
        decimalPoints,
      );
      const cpm = Number(channel.cpm);
      const estimatedImpressions = Math.floor((allocatedBudget / cpm) * 1000);
      const estimatedReach = Math.floor(estimatedImpressions / FREQUENCY_CAP);

      return {
        campaignId: campaign.id,
        channelId: channel.id,
        allocatedBudget,
        currencyId: campaign.currencyId,
        estimatedImpressions,
        estimatedReach,
        days: campaign.days,
        schedule,
      } as Partial<CampaignChannel>;
    });

    this.adjustRounding(allocations, channels, budget, decimalPoints);

    if (transactionManager) {
      await transactionManager.delete(CampaignChannel, {
        campaignId: campaign.id,
      });
      return transactionManager.save(CampaignChannel, allocations);
    } else {
      await this.campaignChannelRepository.delete({ campaignId: campaign.id });
      return this.campaignChannelRepository.save(allocations);
    }
  }

  calculateWeights(channels: Channel[], goal: CampaignGoal): number[] {
    switch (goal) {
      case CampaignGoal.REACH: {
        const inverseCpms = channels.map((c) => 1 / Number(c.cpm));
        const total = inverseCpms.reduce((sum, v) => sum + v, 0);
        return inverseCpms.map((v) => v / total);
      }
      case CampaignGoal.ENGAGEMENT: {
        const cpms = channels.map((c) => Number(c.cpm));
        const total = cpms.reduce((sum, v) => sum + v, 0);
        return cpms.map((v) => v / total);
      }
      case CampaignGoal.BALANCED: {
        const weight = 1 / channels.length;
        return channels.map(() => weight);
      }
    }
  }

  generateDateRange(from: string, to: string): string[] {
    const dates: string[] = [];
    const current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private round(value: number, decimalPoints: number): number {
    const factor = Math.pow(10, decimalPoints);
    return Math.round(value * factor) / factor;
  }

  private adjustRounding(
    allocations: Partial<CampaignChannel>[],
    channels: Channel[],
    totalBudget: number,
    decimalPoints: number,
  ): void {
    const sum = allocations.reduce(
      (acc, a) => acc + Number(a.allocatedBudget),
      0,
    );
    const diff = this.round(totalBudget - sum, decimalPoints);

    if (diff !== 0 && allocations.length > 0) {
      const lastIndex = allocations.length - 1;
      const last = allocations[lastIndex];
      const lastChannel = channels[lastIndex];

      last.allocatedBudget = this.round(
        Number(last.allocatedBudget) + diff,
        decimalPoints,
      );
      const cpm = Number(lastChannel.cpm);
      last.estimatedImpressions = Math.floor(
        (Number(last.allocatedBudget) / cpm) * 1000,
      );
      last.estimatedReach = Math.floor(
        last.estimatedImpressions / FREQUENCY_CAP,
      );
    }
  }
}

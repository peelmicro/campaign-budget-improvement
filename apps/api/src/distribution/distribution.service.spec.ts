import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DistributionService } from './distribution.service';
import { Channel } from '../channel/channel.entity';
import { CampaignChannel } from '../campaign/campaign-channel.entity';
import { Campaign } from '../campaign/campaign.entity';
import { CampaignGoal } from '../campaign/campaign-goal.enum';
import { EngagementRank } from '../channel/engagement-rank.enum';
import { FREQUENCY_CAP } from './constants';

const mockChannels: Partial<Channel>[] = [
  { id: 1, code: 'VIDEO', cpm: 15.0, engagementRank: EngagementRank.HIGH },
  { id: 2, code: 'DISPLAY', cpm: 10.0, engagementRank: EngagementRank.MEDIUM },
  { id: 3, code: 'SOCIAL', cpm: 3.0, engagementRank: EngagementRank.LOW },
];

const baseCampaign: Partial<Campaign> = {
  id: 1,
  budget: 10000,
  currencyId: 1,
  currency: { id: 1, code: 'USD', isoNumber: '840', symbol: '$', decimalPoints: 2, createdAt: new Date(), updatedAt: new Date() },
  days: 30,
  fromDate: '2026-04-01',
  toDate: '2026-04-30',
};

const mockChannelRepository = {
  find: vi.fn().mockResolvedValue(mockChannels),
};

const mockCampaignChannelRepository = {
  delete: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockImplementation((allocations) => Promise.resolve(allocations)),
};

describe('DistributionService', () => {
  let service: DistributionService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributionService,
        { provide: getRepositoryToken(Channel), useValue: mockChannelRepository },
        { provide: getRepositoryToken(CampaignChannel), useValue: mockCampaignChannelRepository },
      ],
    }).compile();

    service = module.get<DistributionService>(DistributionService);
  });

  describe('calculateWeights', () => {
    it('REACH: should weight by inverse CPM (cheaper gets more)', () => {
      const weights = service.calculateWeights(mockChannels as Channel[], CampaignGoal.REACH);

      // inverseCPM: Video=1/15=0.0667, Display=1/10=0.1, Social=1/3=0.3333
      // sum = 0.5
      // Video: 0.0667/0.5 = 0.1333, Display: 0.1/0.5 = 0.2, Social: 0.3333/0.5 = 0.6667
      expect(weights[0]).toBeCloseTo(0.1333, 3); // Video (most expensive, least weight)
      expect(weights[1]).toBeCloseTo(0.2, 3);    // Display
      expect(weights[2]).toBeCloseTo(0.6667, 3); // Social (cheapest, most weight)
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    });

    it('ENGAGEMENT: should weight by CPM (expensive gets more)', () => {
      const weights = service.calculateWeights(mockChannels as Channel[], CampaignGoal.ENGAGEMENT);

      // CPM sum = 15 + 10 + 3 = 28
      // Video: 15/28 = 0.5357, Display: 10/28 = 0.3571, Social: 3/28 = 0.1071
      expect(weights[0]).toBeCloseTo(0.5357, 3); // Video (most expensive, most weight)
      expect(weights[1]).toBeCloseTo(0.3571, 3); // Display
      expect(weights[2]).toBeCloseTo(0.1071, 3); // Social (cheapest, least weight)
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    });

    it('BALANCED: should split equally', () => {
      const weights = service.calculateWeights(mockChannels as Channel[], CampaignGoal.BALANCED);

      expect(weights[0]).toBeCloseTo(1 / 3, 10);
      expect(weights[1]).toBeCloseTo(1 / 3, 10);
      expect(weights[2]).toBeCloseTo(1 / 3, 10);
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    });
  });

  describe('distribute', () => {
    it('REACH: should allocate more budget to cheaper channels', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.REACH } as Campaign;
      const result = await service.distribute(campaign);

      expect(result).toHaveLength(3);

      const video = result.find((r) => r.channelId === 1);
      const display = result.find((r) => r.channelId === 2);
      const social = result.find((r) => r.channelId === 3);

      // Social (cheapest at $3) should get the most budget
      expect(Number(social.allocatedBudget)).toBeGreaterThan(Number(display.allocatedBudget));
      expect(Number(display.allocatedBudget)).toBeGreaterThan(Number(video.allocatedBudget));
    });

    it('ENGAGEMENT: should allocate more budget to expensive channels', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.ENGAGEMENT } as Campaign;
      const result = await service.distribute(campaign);

      const video = result.find((r) => r.channelId === 1);
      const display = result.find((r) => r.channelId === 2);
      const social = result.find((r) => r.channelId === 3);

      // Video (most expensive at $15) should get the most budget
      expect(Number(video.allocatedBudget)).toBeGreaterThan(Number(display.allocatedBudget));
      expect(Number(display.allocatedBudget)).toBeGreaterThan(Number(social.allocatedBudget));
    });

    it('BALANCED: should allocate budget equally', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.BALANCED } as Campaign;
      const result = await service.distribute(campaign);

      const budgets = result.map((r) => Number(r.allocatedBudget));
      // All should be ~3333.33, with rounding adjustment on the last
      const sum = budgets.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(10000, 2);
    });

    it('should ensure allocated budgets sum to total budget (rounding)', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.REACH } as Campaign;
      const result = await service.distribute(campaign);

      const sum = result.reduce((acc, r) => acc + Number(r.allocatedBudget), 0);
      expect(Math.round(sum * 100) / 100).toBe(10000);
    });

    it('should calculate impressions correctly', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.BALANCED } as Campaign;
      const result = await service.distribute(campaign);

      for (const allocation of result) {
        const channel = mockChannels.find((c) => c.id === allocation.channelId);
        const expectedImpressions = Math.floor(
          (Number(allocation.allocatedBudget) / Number(channel.cpm)) * 1000,
        );
        expect(allocation.estimatedImpressions).toBe(expectedImpressions);
      }
    });

    it('should calculate reach correctly using FREQUENCY_CAP', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.BALANCED } as Campaign;
      const result = await service.distribute(campaign);

      for (const allocation of result) {
        const expectedReach = Math.floor(allocation.estimatedImpressions / FREQUENCY_CAP);
        expect(allocation.estimatedReach).toBe(expectedReach);
      }
    });

    it('should delete existing allocations before saving new ones', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.REACH } as Campaign;
      await service.distribute(campaign);

      expect(mockCampaignChannelRepository.delete).toHaveBeenCalledWith({ campaignId: 1 });
      expect(mockCampaignChannelRepository.save).toHaveBeenCalled();
    });

    it('should set correct days and currencyId', async () => {
      const campaign = { ...baseCampaign, goal: CampaignGoal.REACH } as Campaign;
      const result = await service.distribute(campaign);

      for (const allocation of result) {
        expect(allocation.days).toBe(30);
        expect(allocation.currencyId).toBe(1);
      }
    });
  });

  describe('generateDateRange', () => {
    it('should generate correct date range', () => {
      const dates = service.generateDateRange('2026-04-01', '2026-04-03');
      expect(dates).toEqual(['2026-04-01', '2026-04-02', '2026-04-03']);
    });

    it('should handle single day', () => {
      const dates = service.generateDateRange('2026-04-01', '2026-04-01');
      expect(dates).toEqual(['2026-04-01']);
    });

    it('should generate 30 dates for a 30-day campaign', () => {
      const dates = service.generateDateRange('2026-04-01', '2026-04-30');
      expect(dates).toHaveLength(30);
      expect(dates[0]).toBe('2026-04-01');
      expect(dates[29]).toBe('2026-04-30');
    });
  });

  describe('edge cases', () => {
    it('should handle single channel (gets 100% of budget)', async () => {
      mockChannelRepository.find.mockResolvedValueOnce([mockChannels[0]]);
      const campaign = { ...baseCampaign, goal: CampaignGoal.REACH } as Campaign;
      const result = await service.distribute(campaign);

      expect(result).toHaveLength(1);
      expect(Number(result[0].allocatedBudget)).toBe(10000);
    });

    it('should handle small budget ($1)', async () => {
      const campaign = {
        ...baseCampaign,
        budget: 1,
        goal: CampaignGoal.BALANCED,
      } as Campaign;
      const result = await service.distribute(campaign);

      const sum = result.reduce((acc, r) => acc + Number(r.allocatedBudget), 0);
      expect(Math.round(sum * 100) / 100).toBe(1);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Channel } from './channel.entity';
import { EngagementRank } from './engagement-rank.enum';

const mockChannels: Partial<Channel>[] = [
  {
    id: 1,
    code: 'VIDEO',
    description: 'Video Ads',
    cpm: 15.0,
    currencyId: 1,
    engagementRank: EngagementRank.HIGH,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    code: 'DISPLAY',
    description: 'Display Ads',
    cpm: 3.0,
    currencyId: 1,
    engagementRank: EngagementRank.MEDIUM,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockChannelService = {
  findAll: vi.fn().mockResolvedValue(mockChannels),
  findOne: vi.fn(),
  findByCode: vi.fn(),
};

describe('ChannelController', () => {
  let controller: ChannelController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [{ provide: ChannelService, useValue: mockChannelService }],
    }).compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  describe('findAll', () => {
    it('should return an array of channels', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockChannels);
      expect(mockChannelService.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a single channel', async () => {
      mockChannelService.findOne.mockResolvedValue(mockChannels[0]);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockChannels[0]);
      expect(mockChannelService.findOne).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      mockChannelService.findOne.mockRejectedValue(
        new NotFoundException('Channel with ID 999 not found'),
      );
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a channel by code (case-insensitive)', async () => {
      mockChannelService.findByCode.mockResolvedValue(mockChannels[0]);
      const result = await controller.findByCode('video');
      expect(result).toEqual(mockChannels[0]);
      expect(mockChannelService.findByCode).toHaveBeenCalledWith('VIDEO');
    });

    it('should propagate NotFoundException for unknown code', async () => {
      mockChannelService.findByCode.mockRejectedValue(
        new NotFoundException('Channel with code UNKNOWN not found'),
      );
      await expect(controller.findByCode('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

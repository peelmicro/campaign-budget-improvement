import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
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

const mockRepository = {
  find: vi.fn().mockResolvedValue(mockChannels),
  findOneBy: vi.fn(),
};

describe('ChannelService', () => {
  let service: ChannelService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        { provide: getRepositoryToken(Channel), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  describe('findAll', () => {
    it('should return an array of channels', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockChannels);
      expect(mockRepository.find).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a channel by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockChannels[0]);
      const result = await service.findOne(1);
      expect(result).toEqual(mockChannels[0]);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when channel not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a channel by code', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockChannels[0]);
      const result = await service.findByCode('VIDEO');
      expect(result).toEqual(mockChannels[0]);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ code: 'VIDEO' });
    });

    it('should throw NotFoundException when code not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findByCode('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

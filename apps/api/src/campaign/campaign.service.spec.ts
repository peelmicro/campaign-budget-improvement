import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CampaignService } from './campaign.service';
import { Campaign } from './campaign.entity';
import { CampaignGoal } from './campaign-goal.enum';
import { DistributionService } from '../distribution/distribution.service';

const mockCampaign: Partial<Campaign> = {
  id: 1,
  code: 'CAMP-001',
  clientId: 1,
  managerName: 'John Doe',
  budget: 10000,
  currencyId: 1,
  days: 30,
  fromDate: '2026-04-01',
  toDate: '2026-04-30',
  goal: CampaignGoal.REACH,
  channels: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCampaigns = [mockCampaign];

const mockRepository = {
  find: vi.fn().mockResolvedValue(mockCampaigns),
  findOneBy: vi.fn(),
  remove: vi.fn(),
};

const mockEntityManager = {
  create: vi.fn(),
  save: vi.fn(),
  findOneBy: vi.fn(),
};

const mockDataSource = {
  transaction: vi.fn().mockImplementation(async (cb) => {
    return cb(mockEntityManager);
  }),
};

const mockDistributionService = {
  distribute: vi.fn().mockResolvedValue([]),
};

describe('CampaignService', () => {
  let service: CampaignService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        { provide: getRepositoryToken(Campaign), useValue: mockRepository },
        { provide: DistributionService, useValue: mockDistributionService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
  });

  describe('findAll', () => {
    it('should return an array of campaigns', async () => {
      const result = await service.findAll();
      expect(result).toEqual(mockCampaigns);
      expect(mockRepository.find).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a campaign by id', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCampaign);
      const result = await service.findOne(1);
      expect(result).toEqual(mockCampaign);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when campaign not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a campaign and call distribute inside a transaction', async () => {
      const dto = {
        code: 'CAMP-001',
        clientId: 1,
        managerName: 'John Doe',
        budget: 10000,
        currencyId: 1,
        days: 30,
        fromDate: '2026-04-01',
        toDate: '2026-04-30',
        goal: CampaignGoal.REACH,
      };
      
      mockEntityManager.create.mockReturnValue(mockCampaign);
      mockEntityManager.save.mockResolvedValue(mockCampaign);
      mockEntityManager.findOneBy.mockResolvedValue(mockCampaign);
      mockRepository.findOneBy.mockResolvedValue(mockCampaign);

      const result = await service.create(dto);
      
      expect(result).toEqual(mockCampaign);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.create).toHaveBeenCalledWith(Campaign, dto);
      expect(mockEntityManager.save).toHaveBeenCalledWith(Campaign, mockCampaign);
      expect(mockDistributionService.distribute).toHaveBeenCalledWith(mockCampaign, mockEntityManager);
    });
  });

  describe('update', () => {
    it('should update the campaign and call distribute inside a transaction', async () => {
      const campaignCopy = { ...mockCampaign };
      const updated = { ...mockCampaign, budget: 20000 };
      
      mockEntityManager.findOneBy.mockResolvedValueOnce(campaignCopy); 
      mockEntityManager.findOneBy.mockResolvedValueOnce(updated);
      mockEntityManager.save.mockResolvedValue(updated);
      mockRepository.findOneBy.mockResolvedValue(updated);

      const result = await service.update(1, { budget: 20000 });
      expect(result).toEqual(updated);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(mockDistributionService.distribute).toHaveBeenCalledWith(updated, mockEntityManager);
    });

    it('should throw NotFoundException when updating non-existent campaign', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(null);
      await expect(service.update(999, { budget: 20000 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('redistribute', () => {
    it('should call distribute inside a transaction and return the campaign', async () => {
      mockEntityManager.findOneBy.mockResolvedValue({ ...mockCampaign });
      mockRepository.findOneBy.mockResolvedValue({ ...mockCampaign });

      const result = await service.redistribute(1);
      expect(result).toEqual(mockCampaign);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockDistributionService.distribute).toHaveBeenCalledWith(mockCampaign, mockEntityManager);
    });

    it('should throw NotFoundException for non-existent campaign', async () => {
      mockEntityManager.findOneBy.mockResolvedValue(null);
      await expect(service.redistribute(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the campaign', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockCampaign);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCampaign);
    });

    it('should throw NotFoundException when removing non-existent campaign', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});

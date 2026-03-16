import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { Campaign } from './campaign.entity';
import { CampaignGoal } from './campaign-goal.enum';

const mockCampaign: Partial<Campaign> = {
  id: 1,
  code: 'CAMP-001',
  clientName: 'Acme Corp',
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

const mockCampaignService = {
  findAll: vi.fn().mockResolvedValue([mockCampaign]),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  redistribute: vi.fn(),
};

describe('CampaignController', () => {
  let controller: CampaignController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [
        { provide: CampaignService, useValue: mockCampaignService },
      ],
    }).compile();

    controller = module.get<CampaignController>(CampaignController);
  });

  describe('findAll', () => {
    it('should return an array of campaigns', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockCampaign]);
      expect(mockCampaignService.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('findOne', () => {
    it('should return a single campaign', async () => {
      mockCampaignService.findOne.mockResolvedValue(mockCampaign);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockCampaign);
      expect(mockCampaignService.findOne).toHaveBeenCalledWith(1);
    });

    it('should propagate NotFoundException', async () => {
      mockCampaignService.findOne.mockRejectedValue(
        new NotFoundException('Campaign with ID 999 not found'),
      );
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a campaign', async () => {
      const dto = {
        code: 'CAMP-001',
        clientName: 'Acme Corp',
        managerName: 'John Doe',
        budget: 10000,
        currencyId: 1,
        days: 30,
        fromDate: '2026-04-01',
        toDate: '2026-04-30',
        goal: CampaignGoal.REACH,
      };
      mockCampaignService.create.mockResolvedValue(mockCampaign);

      const result = await controller.create(dto);
      expect(result).toEqual(mockCampaign);
      expect(mockCampaignService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update and return the campaign', async () => {
      const updated = { ...mockCampaign, budget: 20000 };
      mockCampaignService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { budget: 20000 });
      expect(result).toEqual(updated);
      expect(mockCampaignService.update).toHaveBeenCalledWith(1, {
        budget: 20000,
      });
    });
  });

  describe('redistribute', () => {
    it('should call redistribute and return the campaign', async () => {
      mockCampaignService.redistribute.mockResolvedValue(mockCampaign);

      const result = await controller.redistribute(1);
      expect(result).toEqual(mockCampaign);
      expect(mockCampaignService.redistribute).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should remove the campaign', async () => {
      mockCampaignService.remove.mockResolvedValue(undefined);

      await controller.remove(1);
      expect(mockCampaignService.remove).toHaveBeenCalledWith(1);
    });
  });
});

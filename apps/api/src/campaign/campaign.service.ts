import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Campaign } from './campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { DistributionService } from '../distribution/distribution.service';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    private readonly distributionService: DistributionService,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  async findOne(id: number): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOneBy({ id });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
  }

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const id = await this.dataSource.transaction(async (manager) => {
      const campaign = manager.create(Campaign, dto);
      const saved = await manager.save(Campaign, campaign);
      const full = await manager.findOneBy(Campaign, { id: saved.id });
      await this.distributionService.distribute(full!, manager);
      return saved.id;
    });
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateCampaignDto): Promise<Campaign> {
    await this.dataSource.transaction(async (manager) => {
      const campaign = await manager.findOneBy(Campaign, { id });
      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }
      Object.assign(campaign, dto);
      await manager.save(Campaign, campaign);
      const full = await manager.findOneBy(Campaign, { id });
      await this.distributionService.distribute(full!, manager);
    });
    return this.findOne(id);
  }

  async redistribute(id: number): Promise<Campaign> {
    await this.dataSource.transaction(async (manager) => {
      const campaign = await manager.findOneBy(Campaign, { id });
      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }
      await this.distributionService.distribute(campaign, manager);
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepository.remove(campaign);
  }
}

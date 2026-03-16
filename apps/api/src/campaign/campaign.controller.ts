import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { Campaign } from './campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  findAll(): Promise<Campaign[]> {
    return this.campaignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Campaign> {
    return this.campaignService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.update(id, dto);
  }

  @Post(':id/distribute')
  redistribute(@Param('id', ParseIntPipe) id: number): Promise<Campaign> {
    return this.campaignService.redistribute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.campaignService.remove(id);
  }
}

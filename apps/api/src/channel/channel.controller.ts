import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Channel } from './channel.entity';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  findAll(): Promise<Channel[]> {
    return this.channelService.findAll();
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<Channel> {
    return this.channelService.findByCode(code.toUpperCase());
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Channel> {
    return this.channelService.findOne(id);
  }
}

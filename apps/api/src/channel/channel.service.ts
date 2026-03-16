import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  findAll(): Promise<Channel[]> {
    return this.channelRepository.find();
  }

  async findOne(id: number): Promise<Channel> {
    const channel = await this.channelRepository.findOneBy({ id });
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    return channel;
  }

  async findByCode(code: string): Promise<Channel> {
    const channel = await this.channelRepository.findOneBy({ code });
    if (!channel) {
      throw new NotFoundException(`Channel with code ${code} not found`);
    }
    return channel;
  }
}

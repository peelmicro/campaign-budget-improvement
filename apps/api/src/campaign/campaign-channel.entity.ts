import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { Channel } from '../channel/channel.entity';
import { Currency } from '../currency/currency.entity';

@Entity()
@Unique(['campaignId', 'channelId'])
export class CampaignChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Campaign, (campaign) => campaign.channels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column()
  campaignId: number;

  @ManyToOne(() => Channel, { eager: true })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @Column()
  channelId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  allocatedBudget: number;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @Column()
  currencyId: number;

  @Column({ type: 'int' })
  estimatedImpressions: number;

  @Column({ type: 'int' })
  estimatedReach: number;

  @Column({ type: 'int' })
  days: number;

  @Column({ type: 'json' })
  schedule: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

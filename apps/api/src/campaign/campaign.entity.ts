import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Currency } from '../currency/currency.entity';
import { CampaignGoal } from './campaign-goal.enum';
import { CampaignChannel } from './campaign-channel.entity';
import { Client } from '../client/client.entity';
import { CampaignStatus } from './campaign-status.enum';

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @ManyToOne(() => Client, { eager: true, nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ nullable: true })
  clientId: number;

  @Column({ type: 'varchar', length: 255 })
  managerName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @Column()
  currencyId: number;

  @Column({ type: 'int' })
  days: number;

  @Column({ type: 'date' })
  fromDate: string;

  @Column({ type: 'date' })
  toDate: string;

  @Column({ type: 'enum', enum: CampaignGoal })
  goal: CampaignGoal;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @OneToMany(() => CampaignChannel, (cc) => cc.campaign, { eager: true })
  channels: CampaignChannel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

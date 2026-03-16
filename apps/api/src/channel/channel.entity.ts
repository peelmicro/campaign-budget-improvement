import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from '../currency/currency.entity';
import { EngagementRank } from './engagement-rank.enum';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cpm: number;

  @ManyToOne(() => Currency, { eager: true })
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @Column()
  currencyId: number;

  @Column({ type: 'enum', enum: EngagementRank })
  engagementRank: EngagementRank;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 3, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 3 })
  isoNumber: string;

  @Column({ type: 'varchar', length: 5 })
  symbol: string;

  @Column({ type: 'int' })
  decimalPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

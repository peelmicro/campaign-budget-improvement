import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CampaignGoal } from '../campaign-goal.enum';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsInt()
  @IsPositive()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  managerName: string;

  @IsNumber()
  @IsPositive()
  budget: number;

  @IsInt()
  @IsPositive()
  currencyId: number;

  @IsInt()
  @Min(1)
  days: number;

  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @IsString()
  @IsNotEmpty()
  toDate: string;

  @IsEnum(CampaignGoal)
  goal: CampaignGoal;
}

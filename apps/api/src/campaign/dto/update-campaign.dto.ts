import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CampaignGoal } from '../campaign-goal.enum';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  clientId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  managerName?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  currencyId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsEnum(CampaignGoal)
  goal?: CampaignGoal;
}

import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ProductCategory, ProductStatus, UsageTime } from '../entities/workspace-product.entity';

const CATEGORIES: ProductCategory[] = [
  'cleanser',
  'moisturizer',
  'sunscreen',
  'serum',
  'retinoid',
  'exfoliant',
  'toner',
  'eye_care',
  'spot_treatment',
  'mask',
  'oil',
  'essence',
  'balm',
];

const STATUSES: ProductStatus[] = ['active', 'testing', 'paused', 'finished', 'wishlist'];

const USAGE_TIMES: UsageTime[] = ['am', 'pm', 'both'];

export class CreateWorkspaceProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  brand?: string | null;

  @IsString()
  @IsIn(CATEGORIES)
  category: ProductCategory;

  @IsString()
  @IsOptional()
  textureFormat?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mainIngredients?: string[] | null;

  @IsString()
  @IsIn(USAGE_TIMES)
  @IsOptional()
  usageTime?: UsageTime | null;

  @IsString()
  @IsIn(STATUSES)
  status: ProductStatus;

  @IsDateString()
  @IsOptional()
  dateOpened?: string | null;

  @IsDateString()
  @IsOptional()
  expirationDate?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  rating?: number | null;

  @IsString()
  @IsOptional()
  reactionNotes?: string | null;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;
}

export class UpdateWorkspaceProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string | null;

  @IsString()
  @IsIn(CATEGORIES)
  @IsOptional()
  category?: ProductCategory;

  @IsString()
  @IsOptional()
  textureFormat?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mainIngredients?: string[] | null;

  @IsString()
  @IsIn(USAGE_TIMES)
  @IsOptional()
  usageTime?: UsageTime | null;

  @IsString()
  @IsIn(STATUSES)
  @IsOptional()
  status?: ProductStatus;

  @IsDateString()
  @IsOptional()
  dateOpened?: string | null;

  @IsDateString()
  @IsOptional()
  expirationDate?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  rating?: number | null;

  @IsString()
  @IsOptional()
  reactionNotes?: string | null;

  @IsString()
  @IsOptional()
  imageUrl?: string | null;
}

import { IsOptional, IsUUID, IsBoolean, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

const SORT_FIELDS = ['updated_at', 'last_used_at', 'created_at', 'title'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

export class ListPromptsQueryDto {
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(SORT_FIELDS)
  sortBy?: (typeof SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(SORT_ORDERS)
  sortOrder?: (typeof SORT_ORDERS)[number];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  recent?: boolean;
}

import { IsInt, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export type DashboardScope = 'all' | 'favorites' | 'selected' | 'current';

export class DashboardWeekQueryDto {
  @IsInt()
  @Type(() => Number)
  year: number;

  @IsInt()
  @Type(() => Number)
  week: number;

  @IsOptional()
  @IsEnum(['all', 'favorites', 'selected', 'current'])
  scope?: DashboardScope;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  workspaceIds?: string[];
}

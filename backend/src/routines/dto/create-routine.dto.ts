import { IsInt, IsObject, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import type { DayContent } from '../entities/routine.entity';

export class CreateRoutineDto {
  @IsString()
  weekLabel: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsInt()
  @Min(1)
  @Max(53)
  @Type(() => Number)
  weekNumber: number;

  @IsObject()
  @IsOptional()
  days?: Record<string, DayContent>;
}

export class UpdateRoutineDto {
  @IsString()
  @IsOptional()
  weekLabel?: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsInt()
  @Min(1)
  @Max(53)
  @IsOptional()
  @Type(() => Number)
  weekNumber?: number;

  @IsObject()
  @IsOptional()
  days?: Record<string, DayContent>;
}

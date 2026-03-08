import { IsInt, IsObject, IsOptional, IsString, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoutineTemplateDto {
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @IsString()
  weekLabel: string;

  @IsInt()
  @Min(0)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsInt()
  @Min(0)
  @Max(53)
  @Type(() => Number)
  weekNumber: number;

  @IsObject()
  @IsOptional()
  days?: Record<string, unknown>;
}

export class UpdateRoutineTemplateDto {
  @IsString()
  @IsOptional()
  weekLabel?: string;

  @IsInt()
  @Min(0)
  @Max(2100)
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsInt()
  @Min(0)
  @Max(53)
  @IsOptional()
  @Type(() => Number)
  weekNumber?: number;

  @IsObject()
  @IsOptional()
  days?: Record<string, unknown>;
}

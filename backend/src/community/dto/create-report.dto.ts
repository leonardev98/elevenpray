import { IsString, IsOptional, IsIn, IsUUID, MaxLength } from 'class-validator';
import { COMMUNITY_REPORT_TARGET_TYPES } from '../entities/community-report.entity';

export class CreateReportDto {
  @IsString()
  @IsIn(COMMUNITY_REPORT_TARGET_TYPES as unknown as string[])
  targetType: string;

  @IsUUID()
  targetId: string;

  @IsString()
  @MaxLength(60)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

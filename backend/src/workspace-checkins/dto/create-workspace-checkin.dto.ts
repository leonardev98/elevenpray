import { IsString, IsOptional, IsObject, IsDateString } from 'class-validator';
import type { CheckinData } from '../entities/workspace-checkin.entity';

export class CreateWorkspaceCheckinDto {
  @IsDateString()
  checkinDate: string;

  @IsObject()
  @IsOptional()
  data?: CheckinData | null;
}

export class UpdateWorkspaceCheckinDto {
  @IsDateString()
  @IsOptional()
  checkinDate?: string;

  @IsObject()
  @IsOptional()
  data?: CheckinData | null;
}

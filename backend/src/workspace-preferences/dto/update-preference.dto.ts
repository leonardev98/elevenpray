import { IsBoolean, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkspacePreferenceDto {
  @IsBoolean()
  @IsOptional()
  favorite?: boolean;

  @IsBoolean()
  @IsOptional()
  visibleOnDashboard?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

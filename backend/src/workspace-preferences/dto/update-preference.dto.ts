import { IsBoolean, IsOptional, IsInt, IsObject } from 'class-validator';
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

  @IsBoolean()
  @IsOptional()
  completeOnboarding?: boolean;

  @IsObject()
  @IsOptional()
  onboardingAnswers?: Record<string, unknown> | null;
}

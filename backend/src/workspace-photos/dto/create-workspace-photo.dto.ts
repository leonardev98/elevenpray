import { IsString, IsOptional, IsIn, IsArray, IsDateString } from 'class-validator';
import type { PhotoAngle } from '../entities/workspace-photo.entity';

const ANGLES: PhotoAngle[] = ['front', 'left', 'right'];

export class CreateWorkspacePhotoDto {
  @IsDateString()
  photoDate: string;

  @IsString()
  @IsIn(ANGLES)
  angle: PhotoAngle;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  concernTags?: string[] | null;

  @IsString()
  imageUrl: string;
}

export class UpdateWorkspacePhotoDto {
  @IsDateString()
  @IsOptional()
  photoDate?: string;

  @IsString()
  @IsIn(ANGLES)
  @IsOptional()
  angle?: PhotoAngle;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  concernTags?: string[] | null;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

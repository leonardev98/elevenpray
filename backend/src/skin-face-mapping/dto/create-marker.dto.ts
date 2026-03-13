import {
  IsString,
  IsOptional,
  IsIn,
  IsNumber,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

const ISSUE_TYPES = [
  'acne',
  'blackheads',
  'redness',
  'pigmentation',
  'dryness',
  'irritation',
  'scar',
  'sensitivity',
  'pore-congestion',
  'custom',
] as const;

const SEVERITIES = ['mild', 'moderate', 'severe'] as const;

const FACE_MODEL_TYPES = ['female', 'male'] as const;

const NOTES_MAX_LENGTH = 500;

export class CreateMarkerDto {
  @IsString()
  @IsIn(ISSUE_TYPES)
  issueType: string;

  @IsString()
  @IsIn(SEVERITIES)
  severity: string;

  @IsString()
  @IsOptional()
  @MaxLength(NOTES_MAX_LENGTH)
  notes?: string | null;

  @IsNumber()
  @Type(() => Number)
  x: number;

  @IsNumber()
  @Type(() => Number)
  y: number;

  @IsNumber()
  @Type(() => Number)
  z: number;

  @IsString()
  @IsOptional()
  regionLabel?: string | null;

  @IsString()
  @IsOptional()
  photoUrl?: string | null;

  @IsUUID()
  @IsOptional()
  sessionId?: string | null;

  @IsString()
  @IsIn(FACE_MODEL_TYPES)
  faceModelType: 'female' | 'male';
}

export class UpdateMarkerDto {
  @IsString()
  @IsIn(ISSUE_TYPES)
  @IsOptional()
  issueType?: string;

  @IsString()
  @IsIn(SEVERITIES)
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(NOTES_MAX_LENGTH)
  notes?: string | null;

  @IsString()
  @IsOptional()
  regionLabel?: string | null;

  @IsString()
  @IsOptional()
  photoUrl?: string | null;
}

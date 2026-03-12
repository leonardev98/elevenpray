import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsIn,
  MaxLength,
} from 'class-validator';

const STATUSES = ['active', 'archived', 'draft'] as const;

export class CreatePromptDto {
  @IsString()
  @MaxLength(500)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  promptType?: string;

  @IsString()
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];

  @IsUUID()
  @IsOptional()
  folderId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  repositoryName?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsOptional()
  tagIds?: string[];

  @IsOptional()
  tagNames?: string[];
}

export class UpdatePromptDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  promptType?: string;

  @IsString()
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];

  @IsUUID()
  @IsOptional()
  folderId?: string | null;

  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @IsUUID()
  @IsOptional()
  projectId?: string | null;

  @IsString()
  @IsOptional()
  repositoryName?: string | null;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsOptional()
  tagIds?: string[];

  @IsOptional()
  tagNames?: string[];
}

import {
  IsString,
  IsIn,
  IsOptional,
  IsInt,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { COMMUNITY_POST_TYPES } from '../entities/community-post.entity';

export class CreatePostDto {
  @IsString()
  @IsIn(COMMUNITY_POST_TYPES as unknown as string[])
  type: string;

  @IsString()
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  course?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  university?: string;

  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  attachmentName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  attachmentSizeBytes?: number;

  @IsOptional()
  @IsString()
  attachmentMime?: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  course?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  university?: string;
}

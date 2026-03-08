import { IsString, IsIn, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

const TOPIC_TYPES = ['rutina', 'notas', 'lista', 'meta', 'curso', 'otro'] as const;

export class CreateTopicDto {
  @IsString()
  title: string;

  @IsString()
  @IsIn(TOPIC_TYPES)
  type: string;
}

export class UpdateTopicDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

import { IsString, IsOptional, IsUrl, IsArray } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl()
  video_url: string;

  @IsOptional()
  @IsUrl()
  thumbnail_url?: string;

  @IsOptional()
  @IsString()
  source_name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  language?: string;
}

import { IsString, IsOptional, IsUrl, IsArray, IsBoolean } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  image_url?: string;

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

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

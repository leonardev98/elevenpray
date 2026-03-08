import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePageDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsUUID()
  spaceId?: string | null;

  @IsOptional()
  @IsUUID()
  parentPageId?: string | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  position?: number;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUUID()
  spaceId?: string | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  position?: number;
}

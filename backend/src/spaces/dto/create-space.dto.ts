import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSpaceDto {
  @IsString()
  title: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  position?: number;
}

export class UpdateSpaceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  position?: number;
}

import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeveloperProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  repositoryName?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateDeveloperProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  repositoryName?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number;
}

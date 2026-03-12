import { IsString, IsOptional } from 'class-validator';

export class CreatePromptTagDto {
  @IsString()
  name: string;
}

export class PromptTagQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

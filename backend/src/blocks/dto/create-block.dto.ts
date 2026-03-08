import { IsString, IsOptional, IsInt, IsObject, IsUUID, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlockDto {
  @IsString()
  type: string;

  @IsUUID()
  @IsOptional()
  containerId?: string | null;

  @IsObject()
  @IsOptional()
  content?: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  position?: number;
}

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsUUID()
  @IsOptional()
  containerId?: string | null;

  @IsObject()
  @IsOptional()
  content?: Record<string, unknown>;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  position?: number;
}

export class ReorderBlocksDto {
  @IsArray()
  @IsUUID('4', { each: true })
  blockIds: string[];
}

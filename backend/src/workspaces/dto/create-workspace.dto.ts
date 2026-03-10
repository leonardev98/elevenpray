import { IsString, IsIn, IsOptional, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { getValidTypeIds } from '../../workspace-types/workspace-type.registry';

export class CreateWorkspaceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsIn([...getValidTypeIds()])
  workspaceType: string;

  @IsOptional()
  @IsUUID()
  workspaceSubtypeId?: string | null;
}

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

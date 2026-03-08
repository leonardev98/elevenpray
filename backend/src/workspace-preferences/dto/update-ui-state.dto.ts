import { IsUUID, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUiStateDto {
  @IsUUID()
  @IsOptional()
  currentWorkspaceId?: string | null;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  selectedWorkspaceIds?: string[];

  @IsBoolean()
  @IsOptional()
  sidebarCollapsed?: boolean;
}

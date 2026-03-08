import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceTypesService } from './workspace-types.service';

@Controller('workspace-types')
@UseGuards(JwtAuthGuard)
export class WorkspaceTypesController {
  constructor(private readonly workspaceTypesService: WorkspaceTypesService) {}

  @Get()
  async getAll() {
    return this.workspaceTypesService.getAll();
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    const type = await this.workspaceTypesService.getByCode(code);
    if (!type) return null;
    return type;
  }
}

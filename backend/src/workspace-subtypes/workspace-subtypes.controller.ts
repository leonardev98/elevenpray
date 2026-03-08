import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceSubtypesService } from './workspace-subtypes.service';

@Controller('workspace-subtypes')
@UseGuards(JwtAuthGuard)
export class WorkspaceSubtypesController {
  constructor(private readonly service: WorkspaceSubtypesService) {}

  @Get()
  async getByWorkspaceType(@Query('workspaceTypeCode') workspaceTypeCode: string) {
    if (workspaceTypeCode) {
      return this.service.getByWorkspaceTypeCode(workspaceTypeCode);
    }
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}

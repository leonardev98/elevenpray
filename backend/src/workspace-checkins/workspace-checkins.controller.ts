import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceCheckinsService } from './workspace-checkins.service';
import { CreateWorkspaceCheckinDto } from './dto/create-workspace-checkin.dto';
import { UpdateWorkspaceCheckinDto } from './dto/create-workspace-checkin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/checkins')
@UseGuards(JwtAuthGuard)
export class WorkspaceCheckinsController {
  constructor(private readonly service: WorkspaceCheckinsService) {}

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    return this.service.findAllByWorkspaceId(workspaceId, userId, fromDate, toDate);
  }

  @Get(':checkinId')
  findOne(
    @Param('workspaceId') _workspaceId: string,
    @Param('checkinId') checkinId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findOne(checkinId, userId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWorkspaceCheckinDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(workspaceId, userId, dto);
  }

  @Patch(':checkinId')
  update(
    @Param('workspaceId') _workspaceId: string,
    @Param('checkinId') checkinId: string,
    @Body() dto: UpdateWorkspaceCheckinDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(checkinId, userId, dto);
  }

  @Delete(':checkinId')
  remove(
    @Param('workspaceId') _workspaceId: string,
    @Param('checkinId') checkinId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.remove(checkinId, userId);
  }
}

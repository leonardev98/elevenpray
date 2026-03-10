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
import { WorkspacePhotosService } from './workspace-photos.service';
import { CreateWorkspacePhotoDto } from './dto/create-workspace-photo.dto';
import { UpdateWorkspacePhotoDto } from './dto/create-workspace-photo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/photos')
@UseGuards(JwtAuthGuard)
export class WorkspacePhotosController {
  constructor(private readonly service: WorkspacePhotosService) {}

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
  ) {
    return this.service.findAllByWorkspaceId(workspaceId, userId, fromDate, toDate);
  }

  @Get(':photoId')
  findOne(
    @Param('workspaceId') _workspaceId: string,
    @Param('photoId') photoId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findOne(photoId, userId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWorkspacePhotoDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(workspaceId, userId, dto);
  }

  @Patch(':photoId')
  update(
    @Param('workspaceId') _workspaceId: string,
    @Param('photoId') photoId: string,
    @Body() dto: UpdateWorkspacePhotoDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(photoId, userId, dto);
  }

  @Delete(':photoId')
  remove(
    @Param('workspaceId') _workspaceId: string,
    @Param('photoId') photoId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.remove(photoId, userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/create-space.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/spaces')
@UseGuards(JwtAuthGuard)
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.spacesService.findAllByWorkspaceId(workspaceId, userId);
  }

  @Get(':spaceId')
  findOne(
    @Param('workspaceId') _workspaceId: string,
    @Param('spaceId') spaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.spacesService.findOne(spaceId, userId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateSpaceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.spacesService.create(workspaceId, userId, dto);
  }

  @Patch(':spaceId')
  update(
    @Param('workspaceId') _workspaceId: string,
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateSpaceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.spacesService.update(spaceId, userId, dto);
  }

  @Delete(':spaceId')
  remove(
    @Param('workspaceId') _workspaceId: string,
    @Param('spaceId') spaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.spacesService.remove(spaceId, userId);
  }
}

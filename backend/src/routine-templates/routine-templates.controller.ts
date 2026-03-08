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
import { RoutineTemplatesService } from './routine-templates.service';
import {
  CreateRoutineTemplateDto,
  UpdateRoutineTemplateDto,
} from './dto/create-routine-template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';

@Controller('routine-templates')
@UseGuards(JwtAuthGuard)
export class RoutineTemplatesController {
  constructor(private readonly routineTemplatesService: RoutineTemplatesService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    if (workspaceId)
      return this.routineTemplatesService.findByWorkspaceId(workspaceId, userId);
    return this.routineTemplatesService.findAllByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.routineTemplatesService.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreateRoutineTemplateDto, @CurrentUser() user: PublicUser) {
    return this.routineTemplatesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoutineTemplateDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.routineTemplatesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.routineTemplatesService.remove(id, user.id);
  }
}

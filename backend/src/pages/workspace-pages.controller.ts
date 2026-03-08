import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/pages')
@UseGuards(JwtAuthGuard)
export class WorkspacePagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  findRootPages(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.pagesService.findRootPages(workspaceId, userId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreatePageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.pagesService.create(workspaceId, userId, dto, null);
  }
}

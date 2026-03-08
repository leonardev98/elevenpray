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
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.pagesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.pagesService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.pagesService.remove(id, userId);
  }

  @Get(':id/children')
  findChildren(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.pagesService.findChildren(id, userId);
  }

  @Post(':id/children')
  async createChild(
    @Param('id') parentId: string,
    @Body() dto: CreatePageDto,
    @CurrentUser('id') userId: string,
  ) {
    const parent = await this.pagesService.findOne(parentId, userId);
    return this.pagesService.create(parent.workspaceId, userId, dto, parentId);
  }
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pages/:pageId/containers')
@UseGuards(JwtAuthGuard)
export class PageContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get()
  findAll(@Param('pageId') pageId: string, @CurrentUser('id') userId: string) {
    return this.containersService.findAllByPageId(pageId, userId);
  }

  @Post()
  create(
    @Param('pageId') pageId: string,
    @Body() dto: CreateContainerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.containersService.create(pageId, userId, dto);
  }
}

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto, ReorderBlocksDto } from './dto/create-block.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pages/:pageId/blocks')
@UseGuards(JwtAuthGuard)
export class PageBlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  findAll(@Param('pageId') pageId: string, @CurrentUser('id') userId: string) {
    return this.blocksService.findAllByPageId(pageId, userId);
  }

  @Post()
  create(
    @Param('pageId') pageId: string,
    @Body() dto: CreateBlockDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.blocksService.create(pageId, userId, dto);
  }

  @Post('reorder')
  reorder(
    @Param('pageId') pageId: string,
    @Body() dto: ReorderBlocksDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.blocksService.reorder(pageId, userId, dto.blockIds);
  }
}

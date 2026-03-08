import { Controller, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { UpdateBlockDto } from './dto/create-block.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.blocksService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.blocksService.remove(id, userId);
  }
}

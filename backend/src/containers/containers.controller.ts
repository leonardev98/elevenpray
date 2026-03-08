import { Controller, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { UpdateContainerDto } from './dto/create-container.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('containers')
@UseGuards(JwtAuthGuard)
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContainerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.containersService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.containersService.remove(id, userId);
  }
}

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
import { PromptFoldersService } from './prompt-folders.service';
import {
  CreatePromptFolderDto,
  UpdatePromptFolderDto,
} from './dto/create-folder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';

@Controller('prompt-folders')
@UseGuards(JwtAuthGuard)
export class PromptFoldersController {
  constructor(private readonly promptFoldersService: PromptFoldersService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.promptFoldersService.findAllByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promptFoldersService.findOne(id, userId);
  }

  @Post()
  create(
    @Body() dto: CreatePromptFolderDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.promptFoldersService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromptFolderDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.promptFoldersService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.promptFoldersService.remove(id, user.id);
  }
}

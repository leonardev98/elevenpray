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
import { WorkspaceProductsService } from './workspace-products.service';
import { CreateWorkspaceProductDto } from './dto/create-workspace-product.dto';
import { UpdateWorkspaceProductDto } from './dto/create-workspace-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { ProductStatus } from './entities/workspace-product.entity';

@Controller('workspaces/:workspaceId/products')
@UseGuards(JwtAuthGuard)
export class WorkspaceProductsController {
  constructor(private readonly service: WorkspaceProductsService) {}

  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('status') status?: ProductStatus,
    @Query('category') category?: string,
  ) {
    return this.service.findAllByWorkspaceId(workspaceId, userId, { status, category });
  }

  @Get(':productId')
  findOne(
    @Param('workspaceId') _workspaceId: string,
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findOne(productId, userId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateWorkspaceProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(workspaceId, userId, dto);
  }

  @Patch(':productId')
  update(
    @Param('workspaceId') _workspaceId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateWorkspaceProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(productId, userId, dto);
  }

  @Delete(':productId')
  remove(
    @Param('workspaceId') _workspaceId: string,
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.remove(productId, userId);
  }
}

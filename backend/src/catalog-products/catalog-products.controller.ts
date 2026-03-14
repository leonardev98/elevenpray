import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CatalogProductsService } from './catalog-products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/catalog')
@UseGuards(JwtAuthGuard)
export class CatalogProductsController {
  constructor(private readonly service: CatalogProductsService) {}

  @Get('bookmarks')
  getBookmarks(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.getBookmarkedIds(userId, workspaceId);
  }

  @Post('bookmarks')
  addBookmark(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { catalogProductId: string },
  ) {
    return this.service.addBookmark(userId, workspaceId, body.catalogProductId);
  }

  @Delete('bookmarks/:catalogProductId')
  removeBookmark(
    @Param('workspaceId') workspaceId: string,
    @Param('catalogProductId') catalogProductId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.removeBookmark(userId, workspaceId, catalogProductId);
  }

  @Get('products')
  list(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Query('category') category?: string,
    @Query('concern') concern?: string,
    @Query('search') search?: string,
    @Query('locale') locale?: string,
  ) {
    return this.service.findPublishedForWorkspace(workspaceId, userId, { category, concern, search }, locale);
  }

  @Get('products/:productId')
  getOne(
    @Param('workspaceId') workspaceId: string,
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
    @Query('locale') locale?: string,
  ) {
    return this.service.findOneForWorkspace(workspaceId, userId, productId, locale);
  }
}

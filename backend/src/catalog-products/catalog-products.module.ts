import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogProduct } from './entities/catalog-product.entity';
import { CatalogProductBookmark } from './entities/catalog-product-bookmark.entity';
import { CatalogProductsService } from './catalog-products.service';
import { CatalogProductsController } from './catalog-products.controller';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CatalogProduct, CatalogProductBookmark]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [CatalogProductsController],
  providers: [CatalogProductsService],
  exports: [CatalogProductsService],
})
export class CatalogProductsModule {}

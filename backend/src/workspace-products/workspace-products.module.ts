import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceProduct } from './entities/workspace-product.entity';
import { WorkspaceProductsController } from './workspace-products.controller';
import { WorkspaceProductsService } from './workspace-products.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceProduct]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [WorkspaceProductsController],
  providers: [WorkspaceProductsService],
  exports: [WorkspaceProductsService],
})
export class WorkspaceProductsModule {}

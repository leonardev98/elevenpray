import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { BlocksController } from './blocks.controller';
import { PageBlocksController } from './page-blocks.controller';
import { BlocksService } from './blocks.service';
import { AuthModule } from '../auth/auth.module';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block]),
    AuthModule,
    PagesModule,
  ],
  controllers: [BlocksController, PageBlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningArticle } from './entities/learning-article.entity';
import { LearningVideo } from './entities/learning-video.entity';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { LearningAdminController } from './learning-admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningArticle, LearningVideo]),
    AuthModule,
  ],
  controllers: [LearningController, LearningAdminController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}

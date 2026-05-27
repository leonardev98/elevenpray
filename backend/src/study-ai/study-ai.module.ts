import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { Course } from '../study-university/entities/course.entity';
import { StudyUniversityModule } from '../study-university/study-university.module';
import { StudyPdfDocument } from './entities/study-pdf-document.entity';
import { FileingestClient } from './fileingest.client';
import { StudyAiController } from './study-ai.controller';
import { StudyAiService } from './study-ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPdfDocument, Course]),
    AuthModule,
    S3Module,
    StudyUniversityModule,
  ],
  controllers: [StudyAiController],
  providers: [StudyAiService, FileingestClient],
  exports: [StudyAiService],
})
export class StudyAiModule {}

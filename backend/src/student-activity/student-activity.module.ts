import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserDailyActivity } from './entities/user-daily-activity.entity';
import { StudentActivityController } from './student-activity.controller';
import { StudentActivityService } from './student-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserDailyActivity]), AuthModule],
  controllers: [StudentActivityController],
  providers: [StudentActivityService],
  exports: [StudentActivityService],
})
export class StudentActivityModule {}

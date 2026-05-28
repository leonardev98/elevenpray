import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StudentActivityModule } from '../student-activity/student-activity.module';
import { EmotionalCheckIn } from './entities/emotional-check-in.entity';
import { UserDailyActivity } from '../student-activity/entities/user-daily-activity.entity';
import { DayEntriesModule } from '../day-entries/day-entries.module';
import { EmotionalCheckinsController } from './emotional-checkins.controller';
import { EmotionalCheckinsService } from './emotional-checkins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmotionalCheckIn, UserDailyActivity]),
    AuthModule,
    StudentActivityModule,
    DayEntriesModule,
  ],
  controllers: [EmotionalCheckinsController],
  providers: [EmotionalCheckinsService],
  exports: [EmotionalCheckinsService],
})
export class EmotionalCheckinsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DayEntry } from './entities/day-entry.entity';
import { DayEntriesController } from './day-entries.controller';
import { DayEntriesService } from './day-entries.service';

@Module({
  imports: [TypeOrmModule.forFeature([DayEntry]), AuthModule],
  controllers: [DayEntriesController],
  providers: [DayEntriesService],
  exports: [DayEntriesService],
})
export class DayEntriesModule {}

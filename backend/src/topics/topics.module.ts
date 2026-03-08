import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { AuthModule } from '../auth/auth.module';
import { RoutinesModule } from '../routines/routines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic]),
    AuthModule,
    RoutinesModule,
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}

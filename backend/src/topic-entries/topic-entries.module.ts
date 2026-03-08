import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicEntry } from './entities/topic-entry.entity';
import { TopicEntriesController } from './topic-entries.controller';
import { TopicEntriesService } from './topic-entries.service';
import { AuthModule } from '../auth/auth.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TopicEntry]),
    AuthModule,
    TopicsModule,
  ],
  controllers: [TopicEntriesController],
  providers: [TopicEntriesService],
  exports: [TopicEntriesService],
})
export class TopicEntriesModule {}

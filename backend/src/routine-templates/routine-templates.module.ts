import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineTemplate } from './entities/routine-template.entity';
import { RoutineTemplatesController } from './routine-templates.controller';
import { RoutineTemplatesService } from './routine-templates.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoutineTemplate]),
    AuthModule,
  ],
  controllers: [RoutineTemplatesController],
  providers: [RoutineTemplatesService],
  exports: [RoutineTemplatesService],
})
export class RoutineTemplatesModule {}

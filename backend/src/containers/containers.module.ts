import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Container } from './entities/container.entity';
import { ContainersController } from './containers.controller';
import { PageContainersController } from './page-containers.controller';
import { ContainersService } from './containers.service';
import { AuthModule } from '../auth/auth.module';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Container]),
    AuthModule,
    PagesModule,
  ],
  controllers: [ContainersController, PageContainersController],
  providers: [ContainersService],
  exports: [ContainersService],
})
export class ContainersModule {}

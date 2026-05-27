import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurriculumService } from './curriculum.service';
import {
  BulkImportCurriculumDto,
  CreateCurriculumCourseDto,
  ReorderCurriculumCoursesDto,
  SetCurriculumStatusDto,
  UpdateCurriculumCourseDto,
} from './dto/curriculum.dto';

@Controller('curriculum')
@UseGuards(JwtAuthGuard)
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  getCurriculum(@CurrentUser('id') userId: string) {
    return this.curriculumService.getCurriculum(userId);
  }

  @Post('courses')
  async createCourse(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCurriculumCourseDto,
  ) {
    try {
      return await this.curriculumService.createCourse(userId, dto);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(message);
    }
  }

  @Patch('courses/:courseId')
  updateCourse(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCurriculumCourseDto,
  ) {
    return this.curriculumService.updateCourse(userId, courseId, dto);
  }

  @Patch('courses/:courseId/status')
  setStatus(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: SetCurriculumStatusDto,
  ) {
    return this.curriculumService.setStatus(userId, courseId, dto);
  }

  @Delete('courses/:courseId')
  deleteCourse(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.curriculumService.deleteCourse(userId, courseId);
  }

  @Post('courses/reorder')
  reorder(
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderCurriculumCoursesDto,
  ) {
    return this.curriculumService.reorder(userId, dto);
  }

  @Post('import')
  bulkImport(
    @CurrentUser('id') userId: string,
    @Body() dto: BulkImportCurriculumDto,
  ) {
    return this.curriculumService.bulkImport(userId, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StudyUniversityService } from './study-university.service';
import {
  CompleteFocusSessionDto,
  CreateAssignmentDto,
  CreateClassSessionDto,
  CreateCourseDto,
  CreateFocusSessionDto,
  CreateGradeItemDto,
  CreateSemesterDto,
  GenerateSessionsDto,
  ReorderCoursesDto,
  UpdateAssignmentStatusDto,
  UpdateClassSessionNotesDto,
  UpsertAttendanceDto,
  UpsertStudyWorkspaceConfigDto,
} from './dto/study-university.dto';

@Controller('study-university/workspaces/:workspaceId')
@UseGuards(JwtAuthGuard)
export class StudyUniversityController {
  constructor(private readonly studyUniversityService: StudyUniversityService) {}

  @Get('state')
  getState(@Param('workspaceId') workspaceId: string, @CurrentUser('id') userId: string) {
    return this.studyUniversityService.getWorkspaceState(workspaceId, userId);
  }

  @Patch('config')
  async upsertConfig(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertStudyWorkspaceConfigDto,
  ) {
    try {
      return await this.studyUniversityService.upsertConfig(workspaceId, userId, dto);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(message);
    }
  }

  @Post('semesters')
  createSemester(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSemesterDto,
  ) {
    return this.studyUniversityService.createSemester(workspaceId, userId, dto);
  }

  @Post('courses')
  async createCourse(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    try {
      return await this.studyUniversityService.createCourse(workspaceId, userId, dto);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(message);
    }
  }

  @Patch('courses/reorder')
  reorderCourses(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderCoursesDto,
  ) {
    return this.studyUniversityService.reorderCourses(workspaceId, userId, dto);
  }

  @Get('conflicts')
  getConflicts(@Param('workspaceId') workspaceId: string, @CurrentUser('id') userId: string) {
    return this.studyUniversityService.getScheduleConflicts(workspaceId, userId);
  }

  @Post('sessions/generate')
  generateSessions(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateSessionsDto,
  ) {
    return this.studyUniversityService.generateClassSessions(workspaceId, userId, dto);
  }

  @Post('sessions')
  createSession(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClassSessionDto,
  ) {
    return this.studyUniversityService.createClassSession(workspaceId, userId, dto);
  }

  @Get('sessions/:sessionId')
  getSessionDetail(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.studyUniversityService.getClassSessionDetail(workspaceId, userId, sessionId);
  }

  @Patch('sessions/:sessionId/notes')
  updateSessionNotes(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateClassSessionNotesDto,
  ) {
    return this.studyUniversityService.updateClassSessionNotes(workspaceId, userId, sessionId, dto);
  }

  @Post('assignments')
  createAssignment(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.studyUniversityService.createAssignment(workspaceId, userId, dto);
  }

  @Patch('assignments/:assignmentId/status')
  updateAssignmentStatus(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.studyUniversityService.updateAssignmentStatus(workspaceId, userId, assignmentId, dto);
  }

  @Post('attendance')
  upsertAttendance(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpsertAttendanceDto,
  ) {
    return this.studyUniversityService.upsertAttendance(workspaceId, userId, dto);
  }

  @Post('grades')
  createGradeItem(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGradeItemDto,
  ) {
    return this.studyUniversityService.createGradeItem(workspaceId, userId, dto);
  }

  @Post('focus-sessions')
  startFocusSession(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFocusSessionDto,
  ) {
    return this.studyUniversityService.startFocusSession(workspaceId, userId, dto);
  }

  @Patch('focus-sessions/:focusSessionId')
  completeFocusSession(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('focusSessionId') focusSessionId: string,
    @Body() dto: CompleteFocusSessionDto,
  ) {
    return this.studyUniversityService.completeFocusSession(workspaceId, userId, focusSessionId, dto);
  }
}

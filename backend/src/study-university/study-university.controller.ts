import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StudyUniversityService } from './study-university.service';
import {
  CombinedQuizPreviewDto,
  CompleteFocusSessionDto,
  CreateAssignmentDto,
  CreateClassSessionDto,
  CreateCourseDto,
  CreateCourseNoteDto,
  CreateFlashcardDto,
  CreateFocusSessionDto,
  CreateGradeItemDto,
  UpdateGradeItemDto,
  CreateQuizAttemptDto,
  CreateQuizDto,
  CreateSemesterDto,
  GenerateSessionsDto,
  ReorderCoursesDto,
  UpdateAssignmentDto,
  UpdateAssignmentStatusDto,
  UpdateClassSessionDto,
  UpdateClassSessionNotesDto,
  UpdateCourseNoteDto,
  UpdateFlashcardDto,
  UpdateQuizDto,
  UpdateSemesterDto,
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
      if (err instanceof HttpException) throw err;
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

  @Patch('semesters/:semesterId')
  updateSemester(
    @Param('workspaceId') workspaceId: string,
    @Param('semesterId') semesterId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSemesterDto,
  ) {
    return this.studyUniversityService.updateSemester(workspaceId, userId, semesterId, dto);
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
      if (err instanceof HttpException) throw err;
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

  @Patch('sessions/:sessionId')
  updateSession(
    @Param('workspaceId') workspaceId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClassSessionDto,
  ) {
    return this.studyUniversityService.updateClassSession(workspaceId, userId, sessionId, dto);
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

  @Post('courses/:courseId/classes/:classSessionId/resources/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadClassResource(
    @Param('workspaceId') workspaceId: string,
    @Param('courseId') courseId: string,
    @Param('classSessionId') classSessionId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile()
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.studyUniversityService.uploadClassResource(
      workspaceId,
      userId,
      courseId,
      classSessionId,
      file,
    );
  }

  @Post('assignments')
  createAssignment(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.studyUniversityService.createAssignment(workspaceId, userId, dto);
  }

  @Patch('assignments/:assignmentId')
  updateAssignment(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.studyUniversityService.updateAssignment(workspaceId, userId, assignmentId, dto);
  }

  @Delete('assignments/:assignmentId')
  deleteAssignment(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.studyUniversityService.deleteAssignment(workspaceId, userId, assignmentId);
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

  @Patch('grades/:gradeItemId')
  updateGradeItem(
    @Param('workspaceId') workspaceId: string,
    @Param('gradeItemId') gradeItemId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateGradeItemDto,
  ) {
    return this.studyUniversityService.updateGradeItem(workspaceId, userId, gradeItemId, dto);
  }

  @Delete('grades/:gradeItemId')
  deleteGradeItem(
    @Param('workspaceId') workspaceId: string,
    @Param('gradeItemId') gradeItemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.studyUniversityService.deleteGradeItem(workspaceId, userId, gradeItemId);
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

  // ----- Flashcards -----

  @Get('courses/:courseId/flashcards')
  listFlashcards(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studyUniversityService.listFlashcards(workspaceId, userId, courseId);
  }

  @Post('courses/:courseId/flashcards')
  createFlashcard(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateFlashcardDto,
  ) {
    return this.studyUniversityService.createFlashcard(workspaceId, userId, courseId, dto);
  }

  @Patch('flashcards/:flashcardId')
  updateFlashcard(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('flashcardId') flashcardId: string,
    @Body() dto: UpdateFlashcardDto,
  ) {
    return this.studyUniversityService.updateFlashcard(workspaceId, userId, flashcardId, dto);
  }

  @Delete('flashcards/:flashcardId')
  deleteFlashcard(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('flashcardId') flashcardId: string,
  ) {
    return this.studyUniversityService.deleteFlashcard(workspaceId, userId, flashcardId);
  }

  // ----- Quizzes -----

  @Get('courses/:courseId/quizzes')
  listQuizzes(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studyUniversityService.listQuizzes(workspaceId, userId, courseId);
  }

  @Post('courses/:courseId/quizzes')
  async createQuiz(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateQuizDto,
  ) {
    try {
      return await this.studyUniversityService.createQuiz(workspaceId, userId, courseId, dto);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new InternalServerErrorException(message);
    }
  }

  @Get('quizzes/:quizId')
  getQuiz(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.studyUniversityService.getQuizDetail(workspaceId, userId, quizId);
  }

  @Patch('quizzes/:quizId')
  updateQuiz(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.studyUniversityService.updateQuiz(workspaceId, userId, quizId, dto);
  }

  @Delete('quizzes/:quizId')
  deleteQuiz(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('quizId') quizId: string,
  ) {
    return this.studyUniversityService.deleteQuiz(workspaceId, userId, quizId);
  }

  @Post('quizzes/combined/preview')
  getCombinedQuizPreview(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CombinedQuizPreviewDto,
  ) {
    return this.studyUniversityService.getCombinedQuizPreview(workspaceId, userId, dto);
  }

  @Post('quizzes/attempts')
  createQuizAttempt(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateQuizAttemptDto,
  ) {
    return this.studyUniversityService.createQuizAttempt(workspaceId, userId, dto);
  }

  @Get('courses/:courseId/quiz-attempts')
  listQuizAttempts(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studyUniversityService.listQuizAttempts(workspaceId, userId, courseId);
  }

  // ----- Course notes -----

  @Get('courses/:courseId/notes')
  listCourseNotes(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studyUniversityService.listCourseNotes(workspaceId, userId, courseId);
  }

  @Post('courses/:courseId/notes')
  createCourseNote(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseNoteDto,
  ) {
    return this.studyUniversityService.createCourseNote(workspaceId, userId, courseId, dto);
  }

  @Patch('notes/:noteId')
  updateCourseNote(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('noteId') noteId: string,
    @Body() dto: UpdateCourseNoteDto,
  ) {
    return this.studyUniversityService.updateCourseNote(workspaceId, userId, noteId, dto);
  }

  @Delete('notes/:noteId')
  deleteCourseNote(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.studyUniversityService.deleteCourseNote(workspaceId, userId, noteId);
  }
}

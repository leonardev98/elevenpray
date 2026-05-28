import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { Assignment } from './entities/assignment.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { ClassSession } from './entities/class-session.entity';
import { Course } from './entities/course.entity';
import { CourseSchedule } from './entities/course-schedule.entity';
import { CourseNote } from './entities/course-note.entity';
import { Flashcard } from './entities/flashcard.entity';
import { FlashcardDeck } from './entities/flashcard-deck.entity';
import { GradeItem } from './entities/grade-item.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt, type QuizAttemptAnswer } from './entities/quiz-attempt.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizQuestionOption } from './entities/quiz-question-option.entity';
import { Reminder } from './entities/reminder.entity';
import { Semester } from './entities/semester.entity';
import { StudyFocusSession } from './entities/study-focus-session.entity';
import { StudyWorkspaceConfig } from './entities/study-workspace-config.entity';
import type { DashboardEntry, DashboardWorkspaceSummary } from '../dashboard/dashboard.types';
import type { ScheduleConflict, UniversityWeekday } from './study-university.types';
import {
  CombinedQuizPreviewDto,
  CompleteFocusSessionDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateClassSessionDto,
  CreateCourseDto,
  CreateCourseNoteDto,
  CreateFlashcardDto,
  CreateFocusSessionDto,
  CreateGradeItemDto,
  CreateQuizAttemptDto,
  CreateQuizDto,
  CreateSemesterDto,
  GenerateSessionsDto,
  ReorderCoursesDto,
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
import {
  attendancePercent,
  detectConflicts,
  hasTimeOverlap,
  weightedAverageInPercent,
} from './study-university.calculations';

const WEEKDAY_INDEX: Record<UniversityWeekday, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

function toDateYmd(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseYmd(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function sameOrBefore(a: Date, b: Date): boolean {
  return a.getTime() <= b.getTime();
}

function toSortableMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

@Injectable()
export class StudyUniversityService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    @InjectRepository(StudyWorkspaceConfig)
    private readonly configRepo: Repository<StudyWorkspaceConfig>,
    @InjectRepository(Semester)
    private readonly semesterRepo: Repository<Semester>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseSchedule)
    private readonly scheduleRepo: Repository<CourseSchedule>,
    @InjectRepository(ClassSession)
    private readonly sessionRepo: Repository<ClassSession>,
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(GradeItem)
    private readonly gradeRepo: Repository<GradeItem>,
    @InjectRepository(FlashcardDeck)
    private readonly deckRepo: Repository<FlashcardDeck>,
    @InjectRepository(Flashcard)
    private readonly flashcardRepo: Repository<Flashcard>,
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizQuestionOption)
    private readonly quizOptionRepo: Repository<QuizQuestionOption>,
    @InjectRepository(QuizAttempt)
    private readonly quizAttemptRepo: Repository<QuizAttempt>,
    @InjectRepository(CourseNote)
    private readonly courseNoteRepo: Repository<CourseNote>,
    @InjectRepository(StudyFocusSession)
    private readonly focusRepo: Repository<StudyFocusSession>,
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
  ) {}

  private async ensureStudyWorkspace(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspacesService.findOne(workspaceId, userId);
    if (workspace.workspaceType !== 'study' && workspace.workspaceType !== 'university') {
      throw new ForbiddenException('This workspace is not a study workspace');
    }
    return workspace;
  }

  private assertValidTimeRange(startTime: string, endTime: string): void {
    if (toSortableMinutes(startTime) >= toSortableMinutes(endTime)) {
      throw new BadRequestException('startTime must be less than endTime');
    }
  }

  async getWorkspaceState(workspaceId: string, userId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const [config, semesters, courses, schedules, sessions, assignments, focusSessions] =
      await Promise.all([
        this.configRepo.findOne({ where: { workspaceId, userId } }),
        this.semesterRepo.find({ where: { workspaceId, userId }, order: { createdAt: 'DESC' } }),
        this.courseRepo.find({ where: { workspaceId, userId }, order: { sortOrder: 'ASC', createdAt: 'ASC' } }),
        this.scheduleRepo.find({ where: { workspaceId } }),
        this.sessionRepo.find({
          where: { workspaceId },
          order: { sessionDate: 'ASC', startTime: 'ASC' },
        }),
        this.assignmentRepo.find({
          where: { workspaceId },
          order: { deadline: 'ASC', createdAt: 'ASC' },
        }),
        this.focusRepo.find({ where: { workspaceId }, order: { startedAt: 'DESC' }, take: 10 }),
      ]);

    const conflicts = this.detectScheduleConflicts(courses, schedules);
    const attendanceByCourse = await this.computeAttendanceByCourse(workspaceId);
    const gradeAveragesByCourse = await this.computeGradeAveragesByCourse(workspaceId);
    const pendingAssignments = assignments.filter((a) => a.status !== 'done' && a.status !== 'submitted');

    return {
      config,
      semesters,
      courses,
      schedules,
      sessions,
      assignments,
      focusSessions,
      conflicts,
      stats: {
        activeCourses: courses.filter((c) => !c.archived).length,
        pendingAssignments: pendingAssignments.length,
        classesToday: sessions.filter((s) => s.sessionDate === toDateYmd(new Date())).length,
        credits: courses.reduce((sum, c) => sum + Number(c.credits ?? 0), 0),
      },
      attendanceByCourse,
      gradeAveragesByCourse,
    };
  }

  async upsertConfig(workspaceId: string, userId: string, dto: UpsertStudyWorkspaceConfigDto) {
    const workspace = await this.ensureStudyWorkspace(workspaceId, userId);
    // Tabla tiene UNIQUE(workspace_id): un config por workspace; buscar solo por workspaceId
    let config = await this.configRepo.findOne({ where: { workspaceId } });
    if (!config) {
      config = this.configRepo.create({
        workspaceId,
        userId,
        subtypeCode: 'university',
        gradeScale: dto.gradeScale ?? '0_100',
        onboardingStep: Math.min(3, Math.max(1, Number(dto.onboardingStep) || 1)),
      });
    }

    if (dto.workspaceName?.trim()) {
      await this.workspacesService.update(workspace.id, userId, { name: dto.workspaceName.trim() });
    }

    if (dto.currentSemesterLabel !== undefined) config.currentSemesterLabel = dto.currentSemesterLabel ?? null;
    if (dto.startDate !== undefined) config.startDate = dto.startDate ?? null;
    if (dto.endDate !== undefined) config.endDate = dto.endDate ?? null;
    if (dto.gradeScale !== undefined) config.gradeScale = dto.gradeScale;
    if (dto.creditGoal !== undefined) {
      const n = Number(dto.creditGoal);
      config.creditGoal = Number.isFinite(n) ? n.toFixed(2) : null;
    }
    if (dto.autoGenerateSessions !== undefined) config.autoGenerateSessions = dto.autoGenerateSessions;
    if (dto.remindersEnabled !== undefined) config.remindersEnabled = dto.remindersEnabled;
    if (dto.conflictDetectionEnabled !== undefined)
      config.conflictDetectionEnabled = dto.conflictDetectionEnabled;
    if (dto.aiSummaryEnabled !== undefined) config.aiSummaryEnabled = dto.aiSummaryEnabled;
    if (dto.onboardingCompleted !== undefined) config.onboardingCompleted = dto.onboardingCompleted;
    if (dto.onboardingStep !== undefined) config.onboardingStep = dto.onboardingStep;

    return this.configRepo.save(config);
  }

  async createSemester(workspaceId: string, userId: string, dto: CreateSemesterDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('startDate must be <= endDate');
    }
    if (dto.isCurrent) {
      await this.semesterRepo.update({ workspaceId, userId, isCurrent: true }, { isCurrent: false });
    }
    const semester = this.semesterRepo.create({
      workspaceId,
      userId,
      name: dto.name,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      isCurrent: dto.isCurrent ?? false,
      creditGoal: dto.creditGoal !== undefined ? dto.creditGoal.toFixed(2) : null,
    });
    return this.semesterRepo.save(semester);
  }

  async updateSemester(
    workspaceId: string,
    userId: string,
    semesterId: string,
    dto: UpdateSemesterDto,
  ): Promise<Semester> {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const semester = await this.semesterRepo.findOne({
      where: { id: semesterId, workspaceId, userId },
    });
    if (!semester) throw new NotFoundException('Semester not found');
    if (dto.startDate != null) semester.startDate = dto.startDate;
    if (dto.endDate != null) semester.endDate = dto.endDate;
    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('startDate must be <= endDate');
    }
    if (dto.name != null) semester.name = dto.name;
    if (dto.isCurrent === true) {
      await this.semesterRepo.update({ workspaceId, userId, isCurrent: true }, { isCurrent: false });
      semester.isCurrent = true;
    }
    return this.semesterRepo.save(semester);
  }

  async createCourse(workspaceId: string, userId: string, dto: CreateCourseDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    dto.schedules.forEach((s) => this.assertValidTimeRange(s.startTime, s.endTime));

    const count = await this.courseRepo.count({ where: { workspaceId, userId } });
    const codeTrimmed = dto.code?.trim();
    const course = await this.courseRepo.save(
      this.courseRepo.create({
        workspaceId,
        userId,
        semesterId: dto.semesterId ?? null,
        name: dto.name,
        code: codeTrimmed && codeTrimmed.length > 0 ? codeTrimmed : null,
        professor: dto.professor ?? null,
        credits:
          dto.credits !== undefined && Number.isFinite(Number(dto.credits))
            ? Math.min(9999.99, Math.max(0, Number(dto.credits))).toFixed(2)
            : null,
        classroom: dto.classroom ?? null,
        courseType: dto.courseType ?? 'lecture',
        colorToken: dto.colorToken,
        icon: dto.icon ?? null,
        sortOrder: count,
      }),
    );

    const schedules = dto.schedules.map((schedule) =>
      this.scheduleRepo.create({
        courseId: course.id,
        workspaceId,
        weekday: schedule.weekday,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        classroom: schedule.classroom ?? null,
      }),
    );
    const savedSchedules = await this.scheduleRepo.save(schedules);
    const conflicts = await this.getScheduleConflicts(workspaceId, userId);

    return { course, schedules: savedSchedules, conflicts };
  }

  async reorderCourses(workspaceId: string, userId: string, dto: ReorderCoursesDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const courses = await this.courseRepo.find({
      where: { workspaceId, userId, id: In(dto.orderedCourseIds) },
    });
    if (courses.length !== dto.orderedCourseIds.length) {
      throw new BadRequestException('Some course ids are invalid');
    }
    await Promise.all(
      dto.orderedCourseIds.map((courseId, index) =>
        this.courseRepo.update({ id: courseId, workspaceId, userId }, { sortOrder: index }),
      ),
    );
    return this.courseRepo.find({ where: { workspaceId, userId }, order: { sortOrder: 'ASC' } });
  }

  async getScheduleConflicts(workspaceId: string, userId: string): Promise<ScheduleConflict[]> {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const [courses, schedules] = await Promise.all([
      this.courseRepo.find({ where: { workspaceId, userId } }),
      this.scheduleRepo.find({ where: { workspaceId } }),
    ]);
    return this.detectScheduleConflicts(courses, schedules);
  }

  private detectScheduleConflicts(courses: Course[], schedules: CourseSchedule[]): ScheduleConflict[] {
    return detectConflicts(courses, schedules);
  }

  async generateClassSessions(
    workspaceId: string,
    userId: string,
    dto: GenerateSessionsDto,
  ): Promise<{ generated: number }> {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const semester = await this.semesterRepo.findOne({
      where: { id: dto.semesterId, workspaceId, userId },
    });
    if (!semester) throw new NotFoundException('Semester not found');
    if (!semester.startDate || !semester.endDate) {
      throw new BadRequestException('Semester must have startDate and endDate');
    }

    const fromDate = dto.fromDate ?? semester.startDate;
    const toDate = dto.toDate ?? semester.endDate;
    const from = parseYmd(fromDate);
    const to = parseYmd(toDate);
    if (!sameOrBefore(from, to)) throw new BadRequestException('Invalid range');

    const courses = await this.courseRepo.find({
      where: { workspaceId, userId, semesterId: semester.id, archived: false },
    });
    const schedules = await this.scheduleRepo.find({
      where: { workspaceId, courseId: In(courses.map((c) => c.id)) },
    });
    let generated = 0;
    const sessionsToSave: ClassSession[] = [];

    const courseById = new Map(courses.map((course) => [course.id, course]));
    for (const schedule of schedules) {
      const course = courseById.get(schedule.courseId);
      if (!course) continue;
      for (let cursor = new Date(from); sameOrBefore(cursor, to); cursor.setDate(cursor.getDate() + 1)) {
        if (cursor.getDay() !== WEEKDAY_INDEX[schedule.weekday]) continue;
        const sessionDate = toDateYmd(cursor);
        const existing = await this.sessionRepo.findOne({
          where: {
            workspaceId,
            courseId: schedule.courseId,
            sessionDate,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          },
        });
        if (existing) continue;

        const collidingSession = await this.sessionRepo.findOne({
          where: { workspaceId, sessionDate, courseId: In(courses.map((c) => c.id)) },
        });
        if (
          collidingSession &&
          collidingSession.courseId !== schedule.courseId &&
          hasTimeOverlap(
            schedule.startTime,
            schedule.endTime,
            collidingSession.startTime,
            collidingSession.endTime,
          )
        ) {
          continue;
        }
        sessionsToSave.push(
          this.sessionRepo.create({
            workspaceId,
            semesterId: semester.id,
            courseId: schedule.courseId,
            scheduleId: schedule.id,
            sessionDate,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            classroom: schedule.classroom ?? course.classroom ?? null,
            title: course.name,
            generatedFromSchedule: true,
          }),
        );
        generated += 1;
      }
    }
    if (sessionsToSave.length > 0) {
      await this.sessionRepo.save(sessionsToSave);
    }
    return { generated };
  }

  async createClassSession(workspaceId: string, userId: string, dto: CreateClassSessionDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    this.assertValidTimeRange(dto.startTime, dto.endTime);

    const course = await this.courseRepo.findOne({ where: { id: dto.courseId, workspaceId, userId } });
    if (!course) throw new NotFoundException('Course not found');

    let classNumber = dto.classNumber ?? null;
    if (classNumber == null) {
      const count = await this.sessionRepo.count({ where: { workspaceId, courseId: dto.courseId } });
      classNumber = count + 1;
    }

    const session = this.sessionRepo.create({
      workspaceId,
      semesterId: dto.semesterId ?? course.semesterId ?? null,
      courseId: dto.courseId,
      scheduleId: null,
      sessionDate: dto.sessionDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      classroom: dto.classroom ?? course.classroom ?? null,
      title: dto.title ?? course.name,
      classNumber,
      unitLabel: dto.unitLabel ?? null,
      generatedFromSchedule: false,
    });
    return this.sessionRepo.save(session);
  }

  async updateClassSession(
    workspaceId: string,
    userId: string,
    sessionId: string,
    dto: UpdateClassSessionDto,
  ): Promise<ClassSession> {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, workspaceId } });
    if (!session) throw new NotFoundException('Class session not found');
    if (dto.sessionDate !== undefined) session.sessionDate = dto.sessionDate;
    if (dto.startTime !== undefined) session.startTime = dto.startTime;
    if (dto.endTime !== undefined) session.endTime = dto.endTime;
    if (dto.classroom !== undefined) session.classroom = dto.classroom ?? null;
    if (dto.title !== undefined) session.title = dto.title ?? null;
    if (dto.classNumber !== undefined) session.classNumber = dto.classNumber ?? null;
    if (dto.unitLabel !== undefined) session.unitLabel = dto.unitLabel ?? null;
    const startTime = session.startTime;
    const endTime = session.endTime;
    this.assertValidTimeRange(startTime, endTime);
    return this.sessionRepo.save(session);
  }

  async updateClassSessionNotes(
    workspaceId: string,
    userId: string,
    sessionId: string,
    dto: UpdateClassSessionNotesDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, workspaceId } });
    if (!session) throw new NotFoundException('Class session not found');
    if (dto.notesHtml !== undefined) session.notesHtml = dto.notesHtml;
    if (dto.notesJson !== undefined) session.notesJson = dto.notesJson;
    if (dto.aiSummaryMock !== undefined) session.aiSummaryMock = dto.aiSummaryMock;
    session.openedAt = new Date();
    return this.sessionRepo.save(session);
  }

  async createAssignment(workspaceId: string, userId: string, dto: CreateAssignmentDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId, workspaceId, userId } });
    if (!course) throw new NotFoundException('Course not found');
    const assignment = this.assignmentRepo.create({
      workspaceId,
      semesterId: dto.semesterId ?? course.semesterId ?? null,
      courseId: dto.courseId,
      classSessionId: dto.classSessionId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      deadline: new Date(dto.deadline),
      priority: dto.priority ?? 'medium',
      status: dto.status ?? 'pending',
      progressPercent: dto.progressPercent ?? 0,
      attachments: dto.attachments ?? [],
    });
    return this.assignmentRepo.save(assignment);
  }

  async updateAssignment(
    workspaceId: string,
    userId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId, workspaceId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    if (dto.title !== undefined) assignment.title = dto.title;
    if (dto.description !== undefined) assignment.description = dto.description ?? null;
    if (dto.deadline !== undefined) assignment.deadline = new Date(dto.deadline);
    if (dto.priority !== undefined) assignment.priority = dto.priority;
    if (dto.status !== undefined) assignment.status = dto.status;
    if (dto.progressPercent !== undefined) {
      assignment.progressPercent = Math.min(100, Math.max(0, dto.progressPercent));
    }
    if (dto.classSessionId !== undefined) {
      if (dto.classSessionId) {
        const session = await this.sessionRepo.findOne({
          where: { id: dto.classSessionId, workspaceId, courseId: assignment.courseId },
        });
        if (!session) throw new NotFoundException('Class session not found');
      }
      assignment.classSessionId = dto.classSessionId;
    }

    return this.assignmentRepo.save(assignment);
  }

  async deleteAssignment(workspaceId: string, userId: string, assignmentId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId, workspaceId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assignmentRepo.remove(assignment);
    return { deleted: true };
  }

  async updateAssignmentStatus(
    workspaceId: string,
    userId: string,
    assignmentId: string,
    dto: UpdateAssignmentStatusDto,
  ) {
    return this.updateAssignment(workspaceId, userId, assignmentId, { status: dto.status });
  }

  async upsertAttendance(workspaceId: string, userId: string, dto: UpsertAttendanceDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    let attendance = await this.attendanceRepo.findOne({
      where: { workspaceId, classSessionId: dto.classSessionId },
    });
    if (!attendance) {
      attendance = this.attendanceRepo.create({
        workspaceId,
        classSessionId: dto.classSessionId,
        courseId: dto.courseId,
        status: dto.status,
        note: dto.note ?? null,
      });
    } else {
      attendance.status = dto.status;
      attendance.note = dto.note ?? null;
    }
    const result = await this.attendanceRepo.save(attendance);
    const attendanceByCourse = await this.computeAttendanceByCourse(workspaceId);
    return { attendance: result, attendanceByCourse };
  }

  async createGradeItem(workspaceId: string, userId: string, dto: CreateGradeItemDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId, workspaceId, userId } });
    if (!course) throw new NotFoundException('Course not found');
    if (dto.score !== undefined && dto.maxScore !== undefined && dto.score > dto.maxScore) {
      throw new BadRequestException('score cannot be greater than maxScore');
    }
    const gradeItem = this.gradeRepo.create({
      workspaceId,
      courseId: dto.courseId,
      classSessionId: dto.classSessionId ?? null,
      name: dto.name,
      type: dto.type,
      weight: dto.weight.toFixed(2),
      score: dto.score !== undefined ? dto.score.toFixed(4) : null,
      maxScore: dto.maxScore !== undefined ? dto.maxScore.toFixed(4) : null,
      gradeDate: dto.gradeDate ?? null,
    });
    const saved = await this.gradeRepo.save(gradeItem);
    const gradeAveragesByCourse = await this.computeGradeAveragesByCourse(workspaceId);
    return { gradeItem: saved, gradeAveragesByCourse };
  }

  async startFocusSession(workspaceId: string, userId: string, dto: CreateFocusSessionDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const session = this.focusRepo.create({
      workspaceId,
      courseId: dto.courseId ?? null,
      durationMinutes: dto.durationMinutes,
      status: 'in_progress',
    });
    return this.focusRepo.save(session);
  }

  async completeFocusSession(
    workspaceId: string,
    userId: string,
    focusSessionId: string,
    dto: CompleteFocusSessionDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const focus = await this.focusRepo.findOne({ where: { id: focusSessionId, workspaceId } });
    if (!focus) throw new NotFoundException('Focus session not found');
    focus.status = dto.status ?? 'completed';
    focus.completedAt = new Date();
    return this.focusRepo.save(focus);
  }

  async getClassSessionDetail(workspaceId: string, userId: string, sessionId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, workspaceId } });
    if (!session) throw new NotFoundException('Class session not found');
    const [course, attendance, assignments, decks] = await Promise.all([
      this.courseRepo.findOne({ where: { id: session.courseId, workspaceId, userId } }),
      this.attendanceRepo.findOne({ where: { workspaceId, classSessionId: sessionId } }),
      this.assignmentRepo.find({
        where: { workspaceId, classSessionId: sessionId },
        order: { deadline: 'ASC' },
      }),
      this.deckRepo.find({ where: { workspaceId, classSessionId: sessionId } }),
    ]);
    return { session, course, attendance, assignments, decks };
  }

  private async computeAttendanceByCourse(workspaceId: string): Promise<Record<string, number>> {
    const attendance = await this.attendanceRepo.find({ where: { workspaceId } });
    const grouped = new Map<string, Array<{ status: 'present' | 'late' | 'absent' | 'justified' }>>();
    for (const record of attendance) {
      const list = grouped.get(record.courseId) ?? [];
      list.push({ status: record.status });
      grouped.set(record.courseId, list);
    }
    return Object.fromEntries(
      [...grouped.entries()].map(([courseId, records]) => [courseId, attendancePercent(records)]),
    );
  }

  private async computeGradeAveragesByCourse(workspaceId: string): Promise<Record<string, number | null>> {
    const items = await this.gradeRepo.find({ where: { workspaceId } });
    const grouped = new Map<string, GradeItem[]>();
    for (const item of items) {
      const list = grouped.get(item.courseId) ?? [];
      list.push(item);
      grouped.set(item.courseId, list);
    }
    const result: Record<string, number | null> = {};
    for (const [courseId, courseItems] of grouped) {
      const graded = courseItems.filter(
        (item) => item.score !== null && item.maxScore !== null && Number(item.maxScore) > 0,
      );
      if (graded.length === 0) {
        result[courseId] = null;
        continue;
      }
      result[courseId] =
        weightedAverageInPercent(
          graded.map((item) => ({
            weight: Number(item.weight ?? 0),
            score: Number(item.score ?? 0),
            maxScore: Number(item.maxScore ?? 1),
          })),
        ) ?? null;
    }
    return result;
  }

  async getGlobalDashboardEntries(
    userId: string,
    from: string,
    to: string,
    workspaceIds: string[],
  ): Promise<DashboardEntry[]> {
    if (workspaceIds.length === 0) return [];
    const assignments = await this.assignmentRepo
      .createQueryBuilder('a')
      .where('a.workspace_id IN (:...workspaceIds)', { workspaceIds })
      .andWhere('a.deadline::date BETWEEN :from AND :to', { from, to })
      .orderBy('a.deadline', 'ASC')
      .getMany();
    const workspaces = await Promise.all(
      workspaceIds.map(async (workspaceId) => this.workspacesService.findOne(workspaceId, userId)),
    );
    const workspaceById = new Map(workspaces.map((w) => [w.id, w]));
    return assignments.map((assignment) => {
      const workspace = workspaceById.get(assignment.workspaceId);
      return {
        id: assignment.id,
        workspaceId: assignment.workspaceId,
        workspaceTitle: workspace?.name ?? 'Study',
        entryDate: toDateYmd(new Date(assignment.deadline)),
        content: assignment.title,
        imageUrl: null,
      };
    });
  }

  async getWorkspaceSummaries(
    userId: string,
    workspaceIds: string[],
  ): Promise<DashboardWorkspaceSummary[]> {
    const summaries: DashboardWorkspaceSummary[] = [];
    for (const workspaceId of workspaceIds) {
      const workspace = await this.workspacesService.findOne(workspaceId, userId);
      if (workspace.workspaceType !== 'study' && workspace.workspaceType !== 'university') continue;

      const [coursesCount, sessionsToday, pendingAssignments, conflicts] = await Promise.all([
        this.courseRepo.count({ where: { workspaceId, archived: false } }),
        this.sessionRepo.count({ where: { workspaceId, sessionDate: toDateYmd(new Date()) } }),
        this.assignmentRepo.count({
          where: {
            workspaceId,
            status: In(['pending', 'in_progress', 'late']),
          },
        }),
        this.getScheduleConflicts(workspaceId, userId),
      ]);

      summaries.push({
        workspaceId,
        workspaceTitle: workspace.name,
        kind: 'study_today',
        data: {
          activeCourses: coursesCount,
          classesToday: sessionsToday,
          pendingAssignments,
          conflicts: conflicts.length,
        },
      });
    }
    return summaries;
  }

  // ====================================================================
  // Flashcards
  // ====================================================================

  private async ensureCourse(
    workspaceId: string,
    userId: string,
    courseId: string,
  ): Promise<Course> {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const course = await this.courseRepo.findOne({ where: { id: courseId, workspaceId, userId } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  private async ensureClassSessionInCourse(
    workspaceId: string,
    courseId: string,
    classSessionId: string,
  ): Promise<ClassSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: classSessionId, workspaceId, courseId },
    });
    if (!session) throw new NotFoundException('Class session not found in course');
    return session;
  }

  async listFlashcards(workspaceId: string, userId: string, courseId: string) {
    await this.ensureCourse(workspaceId, userId, courseId);
    const flashcards = await this.flashcardRepo.find({
      where: { workspaceId, courseId },
      order: { createdAt: 'DESC' },
    });
    const sessionIds = Array.from(
      new Set(flashcards.map((f) => f.classSessionId).filter((id): id is string => Boolean(id))),
    );
    const sessions = sessionIds.length
      ? await this.sessionRepo.find({ where: { id: In(sessionIds) } })
      : [];
    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    return flashcards.map((card) => ({
      id: card.id,
      courseId: card.courseId,
      workspaceId: card.workspaceId,
      classSessionId: card.classSessionId,
      classNumber: card.classSessionId ? sessionMap.get(card.classSessionId)?.classNumber ?? null : null,
      classTitle: card.classSessionId ? sessionMap.get(card.classSessionId)?.title ?? null : null,
      question: card.question,
      answer: card.answer,
      hint: card.hint,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));
  }

  async createFlashcard(
    workspaceId: string,
    userId: string,
    courseId: string,
    dto: CreateFlashcardDto,
  ) {
    const course = await this.ensureCourse(workspaceId, userId, courseId);
    if (dto.classSessionId) {
      await this.ensureClassSessionInCourse(workspaceId, courseId, dto.classSessionId);
    }
    const flashcard = this.flashcardRepo.create({
      workspaceId,
      courseId: course.id,
      classSessionId: dto.classSessionId ?? null,
      deckId: null,
      question: dto.question,
      answer: dto.answer,
      hint: dto.hint ?? null,
    });
    return this.flashcardRepo.save(flashcard);
  }

  async updateFlashcard(
    workspaceId: string,
    userId: string,
    flashcardId: string,
    dto: UpdateFlashcardDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const flashcard = await this.flashcardRepo.findOne({ where: { id: flashcardId, workspaceId } });
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    if (dto.classSessionId !== undefined && dto.classSessionId !== null && flashcard.courseId) {
      await this.ensureClassSessionInCourse(workspaceId, flashcard.courseId, dto.classSessionId);
      flashcard.classSessionId = dto.classSessionId;
    } else if (dto.classSessionId === null) {
      flashcard.classSessionId = null;
    }
    if (dto.question !== undefined) flashcard.question = dto.question;
    if (dto.answer !== undefined) flashcard.answer = dto.answer;
    if (dto.hint !== undefined) flashcard.hint = dto.hint ?? null;
    return this.flashcardRepo.save(flashcard);
  }

  async deleteFlashcard(workspaceId: string, userId: string, flashcardId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const flashcard = await this.flashcardRepo.findOne({ where: { id: flashcardId, workspaceId } });
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    await this.flashcardRepo.delete({ id: flashcardId });
    return { ok: true };
  }

  // ====================================================================
  // Quizzes
  // ====================================================================

  private validateQuizQuestionPayload(question: CreateQuizDto['questions'][number]): void {
    if (question.type === 'multiple_choice') {
      const options = question.options ?? [];
      if (options.length < 2) {
        throw new BadRequestException('multiple_choice questions need at least 2 options');
      }
      if (!options.some((o) => o.isCorrect)) {
        throw new BadRequestException('multiple_choice questions need at least one correct option');
      }
    } else if (question.type === 'true_false') {
      const options = question.options ?? [];
      if (options.length !== 2) {
        throw new BadRequestException('true_false questions need exactly 2 options');
      }
      if (!options.some((o) => o.isCorrect)) {
        throw new BadRequestException('true_false questions need a correct option');
      }
    } else if (question.type === 'short_answer') {
      if (!question.expectedAnswer || !question.expectedAnswer.trim()) {
        throw new BadRequestException('short_answer questions need an expectedAnswer');
      }
    }
  }

  async listQuizzes(workspaceId: string, userId: string, courseId: string) {
    await this.ensureCourse(workspaceId, userId, courseId);
    const quizzes = await this.quizRepo.find({
      where: { workspaceId, courseId },
      order: { createdAt: 'DESC' },
    });
    if (quizzes.length === 0) return [];

    const quizIds = quizzes.map((q) => q.id);
    const sessionIds = Array.from(
      new Set(quizzes.map((q) => q.classSessionId).filter((id): id is string => Boolean(id))),
    );
    const [questions, sessions] = await Promise.all([
      this.quizQuestionRepo.find({ where: { quizId: In(quizIds) } }),
      sessionIds.length ? this.sessionRepo.find({ where: { id: In(sessionIds) } }) : Promise.resolve([] as ClassSession[]),
    ]);
    const countMap = new Map<string, number>();
    for (const q of questions) {
      countMap.set(q.quizId, (countMap.get(q.quizId) ?? 0) + 1);
    }
    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    return quizzes.map((quiz) => ({
      id: quiz.id,
      workspaceId: quiz.workspaceId,
      courseId: quiz.courseId,
      classSessionId: quiz.classSessionId,
      classNumber: quiz.classSessionId ? sessionMap.get(quiz.classSessionId)?.classNumber ?? null : null,
      classTitle: quiz.classSessionId ? sessionMap.get(quiz.classSessionId)?.title ?? null : null,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      questionCount: countMap.get(quiz.id) ?? 0,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    }));
  }

  async createQuiz(
    workspaceId: string,
    userId: string,
    courseId: string,
    dto: CreateQuizDto,
  ) {
    const course = await this.ensureCourse(workspaceId, userId, courseId);
    if (dto.classSessionId) {
      await this.ensureClassSessionInCourse(workspaceId, courseId, dto.classSessionId);
    }
    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('Quiz requires at least one question');
    }
    dto.questions.forEach((q) => this.validateQuizQuestionPayload(q));

    const quiz = await this.quizRepo.save(
      this.quizRepo.create({
        workspaceId,
        courseId: course.id,
        classSessionId: dto.classSessionId ?? null,
        userId,
        title: dto.title,
        description: dto.description ?? null,
        difficulty: dto.difficulty ?? 3,
      }),
    );

    const questionEntities: QuizQuestion[] = dto.questions.map((q, idx) =>
      this.quizQuestionRepo.create({
        quizId: quiz.id,
        type: q.type,
        prompt: q.prompt,
        explanation: q.explanation ?? null,
        expectedAnswer: q.expectedAnswer ?? null,
        position: idx,
      }),
    );
    const optionEntities: QuizQuestionOption[] = [];
    const savedQuestions = await this.quizQuestionRepo.save(questionEntities);

    savedQuestions.forEach((question, qIdx) => {
      const payload = dto.questions[qIdx];
      if (payload.options && payload.options.length > 0) {
        payload.options.forEach((opt, oIdx) => {
          optionEntities.push(
            this.quizOptionRepo.create({
              questionId: question.id,
              label: opt.label,
              text: opt.text,
              isCorrect: opt.isCorrect,
              position: oIdx,
            }),
          );
        });
      }
    });
    if (optionEntities.length > 0) {
      await this.quizOptionRepo.save(optionEntities);
    }

    return this.getQuizDetail(workspaceId, userId, quiz.id);
  }

  async updateQuiz(
    workspaceId: string,
    userId: string,
    quizId: string,
    dto: UpdateQuizDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const quiz = await this.quizRepo.findOne({ where: { id: quizId, workspaceId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (dto.classSessionId !== undefined && dto.classSessionId !== null) {
      await this.ensureClassSessionInCourse(workspaceId, quiz.courseId, dto.classSessionId);
      quiz.classSessionId = dto.classSessionId;
    } else if (dto.classSessionId === null) {
      quiz.classSessionId = null;
    }
    if (dto.title !== undefined) quiz.title = dto.title;
    if (dto.description !== undefined) quiz.description = dto.description ?? null;
    if (dto.difficulty !== undefined) quiz.difficulty = dto.difficulty;
    return this.quizRepo.save(quiz);
  }

  async deleteQuiz(workspaceId: string, userId: string, quizId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const quiz = await this.quizRepo.findOne({ where: { id: quizId, workspaceId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.quizRepo.delete({ id: quizId });
    return { ok: true };
  }

  async getQuizDetail(workspaceId: string, userId: string, quizId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const quiz = await this.quizRepo.findOne({ where: { id: quizId, workspaceId } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    const questions = await this.quizQuestionRepo.find({
      where: { quizId },
      order: { position: 'ASC' },
    });
    const questionIds = questions.map((q) => q.id);
    const options = questionIds.length
      ? await this.quizOptionRepo.find({
          where: { questionId: In(questionIds) },
          order: { position: 'ASC' },
        })
      : [];
    const session = quiz.classSessionId
      ? await this.sessionRepo.findOne({ where: { id: quiz.classSessionId } })
      : null;
    return {
      id: quiz.id,
      workspaceId: quiz.workspaceId,
      courseId: quiz.courseId,
      classSessionId: quiz.classSessionId,
      classNumber: session?.classNumber ?? null,
      classTitle: session?.title ?? null,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        explanation: q.explanation,
        expectedAnswer: q.expectedAnswer,
        position: q.position,
        options: options
          .filter((o) => o.questionId === q.id)
          .map((o) => ({
            id: o.id,
            label: o.label,
            text: o.text,
            isCorrect: o.isCorrect,
            position: o.position,
          })),
      })),
    };
  }

  async getCombinedQuizPreview(
    workspaceId: string,
    userId: string,
    dto: CombinedQuizPreviewDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    if (!dto.quizIds || dto.quizIds.length === 0) {
      throw new BadRequestException('quizIds is required');
    }
    const quizzes = await this.quizRepo.find({ where: { id: In(dto.quizIds), workspaceId } });
    if (quizzes.length === 0) {
      throw new NotFoundException('No quizzes found for the requested ids');
    }
    const sessionIds = Array.from(
      new Set(quizzes.map((q) => q.classSessionId).filter((id): id is string => Boolean(id))),
    );
    const [questions, sessions] = await Promise.all([
      this.quizQuestionRepo.find({
        where: { quizId: In(quizzes.map((q) => q.id)) },
        order: { position: 'ASC' },
      }),
      sessionIds.length ? this.sessionRepo.find({ where: { id: In(sessionIds) } }) : Promise.resolve([] as ClassSession[]),
    ]);
    const options = questions.length
      ? await this.quizOptionRepo.find({
          where: { questionId: In(questions.map((q) => q.id)) },
          order: { position: 'ASC' },
        })
      : [];
    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));

    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return {
      quizIds: quizzes.map((q) => q.id),
      classSessionIds: sessionIds,
      classNumbers: sessionIds
        .map((id) => sessionMap.get(id)?.classNumber ?? null)
        .filter((n): n is number => typeof n === 'number')
        .sort((a, b) => a - b),
      courseId: quizzes[0].courseId,
      questions: shuffled.map((q) => {
        const parentQuiz = quizMap.get(q.quizId);
        const session = parentQuiz?.classSessionId ? sessionMap.get(parentQuiz.classSessionId) : null;
        return {
          id: q.id,
          quizId: q.quizId,
          quizTitle: parentQuiz?.title ?? '',
          classNumber: session?.classNumber ?? null,
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation,
          expectedAnswer: q.expectedAnswer,
          options: options
            .filter((o) => o.questionId === q.id)
            .map((o) => ({
              id: o.id,
              label: o.label,
              text: o.text,
              isCorrect: o.isCorrect,
            })),
        };
      }),
    };
  }

  async createQuizAttempt(
    workspaceId: string,
    userId: string,
    dto: CreateQuizAttemptDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    if (!dto.sourceQuizIds || dto.sourceQuizIds.length === 0) {
      throw new BadRequestException('sourceQuizIds is required');
    }
    const quizzes = await this.quizRepo.find({
      where: { id: In(dto.sourceQuizIds), workspaceId },
    });
    if (quizzes.length === 0) {
      throw new NotFoundException('No quizzes found for the requested ids');
    }
    const courseId = quizzes[0].courseId;
    const questionIds = (dto.answers ?? []).map((a) => a.questionId);
    const [questions, options] = await Promise.all([
      questionIds.length
        ? this.quizQuestionRepo.find({ where: { id: In(questionIds) } })
        : Promise.resolve([] as QuizQuestion[]),
      questionIds.length
        ? this.quizOptionRepo.find({ where: { questionId: In(questionIds) } })
        : Promise.resolve([] as QuizQuestionOption[]),
    ]);
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const optionsByQuestion = new Map<string, QuizQuestionOption[]>();
    for (const opt of options) {
      const list = optionsByQuestion.get(opt.questionId) ?? [];
      list.push(opt);
      optionsByQuestion.set(opt.questionId, list);
    }

    const detailedAnswers: QuizAttemptAnswer[] = [];
    let correctCount = 0;
    for (const a of dto.answers) {
      const question = questionMap.get(a.questionId);
      if (!question) continue;
      let correct = false;
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const opts = optionsByQuestion.get(question.id) ?? [];
        const correctIds = opts.filter((o) => o.isCorrect).map((o) => o.id).sort();
        const selected = (a.selectedOptionIds ?? [a.selectedOptionId].filter(Boolean)) as string[];
        const sel = [...selected].sort();
        correct =
          correctIds.length === sel.length &&
          correctIds.every((id, idx) => id === sel[idx]);
      } else if (question.type === 'short_answer') {
        const expected = (question.expectedAnswer ?? '').trim().toLowerCase();
        const given = (a.textAnswer ?? '').trim().toLowerCase();
        correct = expected.length > 0 && expected === given;
      }
      if (correct) correctCount += 1;
      detailedAnswers.push({
        questionId: question.id,
        selectedOptionId: a.selectedOptionId ?? null,
        selectedOptionIds: a.selectedOptionIds,
        textAnswer: a.textAnswer ?? null,
        correct,
      });
    }

    const totalQuestions = dto.answers.length;
    const passed = totalQuestions > 0 && correctCount / totalQuestions >= 0.6;

    const attempt = this.quizAttemptRepo.create({
      workspaceId,
      courseId,
      userId,
      sourceKind: dto.sourceKind,
      sourceQuizIds: dto.sourceQuizIds,
      classSessionIds: dto.classSessionIds ?? null,
      totalQuestions,
      correctCount,
      passed,
      durationSeconds: dto.durationSeconds ?? null,
      answers: detailedAnswers,
      completedAt: new Date(),
    });
    const saved = await this.quizAttemptRepo.save(attempt);
    // Devolvemos el mismo shape que `listQuizAttempts` para que el cliente
    // pueda renderizar el intento recién creado (necesita `sourceQuizTitles`).
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));
    return this.serializeQuizAttempt(saved, quizMap);
  }

  private serializeQuizAttempt(
    a: QuizAttempt,
    quizMap: Map<string, Quiz>,
  ) {
    return {
      id: a.id,
      sourceKind: a.sourceKind,
      sourceQuizIds: a.sourceQuizIds,
      sourceQuizTitles: (a.sourceQuizIds ?? [])
        .map((id) => quizMap.get(id)?.title ?? '')
        .filter(Boolean),
      classSessionIds: a.classSessionIds,
      totalQuestions: a.totalQuestions,
      correctCount: a.correctCount,
      passed: a.passed,
      durationSeconds: a.durationSeconds,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      answers: a.answers,
    };
  }

  async listQuizAttempts(workspaceId: string, userId: string, courseId: string) {
    await this.ensureCourse(workspaceId, userId, courseId);
    const attempts = await this.quizAttemptRepo.find({
      where: { workspaceId, courseId, userId },
      order: { completedAt: 'DESC' },
      take: 30,
    });
    const quizIds = Array.from(
      new Set(attempts.flatMap((a) => a.sourceQuizIds ?? [])),
    );
    const quizzes = quizIds.length
      ? await this.quizRepo.find({ where: { id: In(quizIds) } })
      : [];
    const quizMap = new Map(quizzes.map((q) => [q.id, q]));
    return attempts.map((a) => this.serializeQuizAttempt(a, quizMap));
  }

  // ====================================================================
  // Course notes
  // ====================================================================

  async listCourseNotes(workspaceId: string, userId: string, courseId: string) {
    await this.ensureCourse(workspaceId, userId, courseId);
    return this.courseNoteRepo.find({
      where: { workspaceId, courseId, userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async createCourseNote(
    workspaceId: string,
    userId: string,
    courseId: string,
    dto: CreateCourseNoteDto,
  ) {
    await this.ensureCourse(workspaceId, userId, courseId);
    if (dto.classSessionId) {
      await this.ensureClassSessionInCourse(workspaceId, courseId, dto.classSessionId);
    }
    const note = this.courseNoteRepo.create({
      workspaceId,
      courseId,
      userId,
      classSessionId: dto.classSessionId ?? null,
      title: dto.title,
      contentJson: dto.contentJson ?? null,
      preview: dto.preview ?? null,
      colorAccent: dto.colorAccent ?? null,
      icon: dto.icon ?? 'book',
      readMinutes: dto.readMinutes ?? 1,
    });
    return this.courseNoteRepo.save(note);
  }

  async updateCourseNote(
    workspaceId: string,
    userId: string,
    noteId: string,
    dto: UpdateCourseNoteDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const note = await this.courseNoteRepo.findOne({ where: { id: noteId, workspaceId, userId } });
    if (!note) throw new NotFoundException('Course note not found');
    if (dto.title !== undefined) note.title = dto.title;
    if (dto.contentJson !== undefined) note.contentJson = dto.contentJson;
    if (dto.preview !== undefined) note.preview = dto.preview ?? null;
    if (dto.colorAccent !== undefined) note.colorAccent = dto.colorAccent ?? null;
    if (dto.icon !== undefined) note.icon = dto.icon;
    if (dto.readMinutes !== undefined) note.readMinutes = dto.readMinutes;
    if (dto.classSessionId !== undefined) {
      if (dto.classSessionId === null) {
        note.classSessionId = null;
      } else {
        await this.ensureClassSessionInCourse(workspaceId, note.courseId, dto.classSessionId);
        note.classSessionId = dto.classSessionId;
      }
    }
    return this.courseNoteRepo.save(note);
  }

  async deleteCourseNote(workspaceId: string, userId: string, noteId: string) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const note = await this.courseNoteRepo.findOne({ where: { id: noteId, workspaceId, userId } });
    if (!note) throw new NotFoundException('Course note not found');
    await this.courseNoteRepo.delete({ id: noteId });
    return { ok: true };
  }
}

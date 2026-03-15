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
import { Flashcard } from './entities/flashcard.entity';
import { FlashcardDeck } from './entities/flashcard-deck.entity';
import { GradeItem } from './entities/grade-item.entity';
import { Reminder } from './entities/reminder.entity';
import { Semester } from './entities/semester.entity';
import { StudyFocusSession } from './entities/study-focus-session.entity';
import { StudyWorkspaceConfig } from './entities/study-workspace-config.entity';
import type { DashboardEntry, DashboardWorkspaceSummary } from '../dashboard/dashboard.types';
import type { ScheduleConflict, UniversityWeekday } from './study-university.types';
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

  async createCourse(workspaceId: string, userId: string, dto: CreateCourseDto) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    dto.schedules.forEach((s) => this.assertValidTimeRange(s.startTime, s.endTime));

    const count = await this.courseRepo.count({ where: { workspaceId, userId } });
    const course = await this.courseRepo.save(
      this.courseRepo.create({
        workspaceId,
        userId,
        semesterId: dto.semesterId ?? null,
        name: dto.name,
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
      generatedFromSchedule: false,
    });
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
      attachments: dto.attachments ?? [],
    });
    return this.assignmentRepo.save(assignment);
  }

  async updateAssignmentStatus(
    workspaceId: string,
    userId: string,
    assignmentId: string,
    dto: UpdateAssignmentStatusDto,
  ) {
    await this.ensureStudyWorkspace(workspaceId, userId);
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId, workspaceId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    assignment.status = dto.status;
    return this.assignmentRepo.save(assignment);
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
}

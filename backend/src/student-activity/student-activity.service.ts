import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDailyActivity } from './entities/user-daily-activity.entity';
import { RecordActivityDto } from './dto/record-activity.dto';

export type StreakVariant = 'estudio' | 'tareas';

export interface StreakSummary {
  actual: number;
  mejor: number;
  hoy: boolean;
  semana: boolean[];
}

export interface ActivitySummaryResponse {
  rachas: {
    estudio: StreakSummary;
    tareas: StreakSummary;
  };
  checkinHoy: boolean;
  xpHoy: number;
  xpMetaDiaria: number;
  xpTareasSemana: number;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function addDaysYmd(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + days);
  return toYmd(d);
}

function getMondayOfWeek(ymd: string): string {
  const d = parseYmd(ymd);
  const jsDay = d.getDay();
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  d.setDate(d.getDate() + diff);
  return toYmd(d);
}

function computeBestStreak(activeDates: string[]): number {
  if (activeDates.length === 0) return 0;
  const sorted = [...new Set(activeDates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = parseYmd(sorted[i - 1]);
    const curr = parseYmd(sorted[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function computeCurrentStreak(activeDates: Set<string>, todayYmd: string): number {
  let cursor = todayYmd;
  if (!activeDates.has(cursor)) {
    cursor = addDaysYmd(todayYmd, -1);
  }
  let count = 0;
  while (activeDates.has(cursor)) {
    count++;
    cursor = addDaysYmd(cursor, -1);
  }
  return count;
}

function buildWeekArray(activeDates: Set<string>, todayYmd: string): boolean[] {
  const monday = getMondayOfWeek(todayYmd);
  const week: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    week.push(activeDates.has(addDaysYmd(monday, i)));
  }
  return week;
}

@Injectable()
export class StudentActivityService {
  constructor(
    @InjectRepository(UserDailyActivity)
    private readonly repo: Repository<UserDailyActivity>,
  ) {}

  async record(userId: string, dto: RecordActivityDto): Promise<UserDailyActivity> {
    const activityDate = dto.date ?? toYmd(new Date());
    let row = await this.repo.findOne({ where: { userId, activityDate } });
    if (!row) {
      row = this.repo.create({ userId, activityDate, study: false, tasks: false, checkin: false });
    }
    if (dto.type === 'study') row.study = true;
    if (dto.type === 'tasks') row.tasks = true;
    if (dto.type === 'checkin') {
      row.checkin = true;
      row.study = true;
    }
    return this.repo.save(row);
  }

  async getSummary(userId: string): Promise<ActivitySummaryResponse> {
    const todayYmd = toYmd(new Date());
    const lookbackStart = addDaysYmd(todayYmd, -120);
    const rows = await this.repo
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.activity_date >= :from', { from: lookbackStart })
      .orderBy('a.activity_date', 'ASC')
      .getMany();

    const studyDates = rows.filter((r) => r.study).map((r) => r.activityDate);
    const taskDates = rows.filter((r) => r.tasks).map((r) => r.activityDate);

    const studySet = new Set(studyDates);
    const taskSet = new Set(taskDates);

    const weekStart = getMondayOfWeek(todayYmd);
    const weekEnd = addDaysYmd(weekStart, 6);

    const tasksThisWeek = rows.filter(
      (r) => r.tasks && r.activityDate >= weekStart && r.activityDate <= weekEnd,
    ).length;

    const studyToday = studySet.has(todayYmd);
    const tasksToday = taskSet.has(todayYmd);

    const xpPerActivity = 20;
    let xpHoy = 0;
    const todayRow = rows.find((r) => r.activityDate === todayYmd);
    if (todayRow?.checkin) xpHoy += xpPerActivity;
    if (todayRow?.study) xpHoy += xpPerActivity;
    if (todayRow?.tasks) xpHoy += xpPerActivity;

    return {
      rachas: {
        estudio: {
          actual: computeCurrentStreak(studySet, todayYmd),
          mejor: computeBestStreak(studyDates),
          hoy: studyToday,
          semana: buildWeekArray(studySet, todayYmd),
        },
        tareas: {
          actual: computeCurrentStreak(taskSet, todayYmd),
          mejor: computeBestStreak(taskDates),
          hoy: tasksToday,
          semana: buildWeekArray(taskSet, todayYmd),
        },
      },
      checkinHoy: todayRow?.checkin ?? false,
      xpHoy,
      xpMetaDiaria: 100,
      xpTareasSemana: tasksThisWeek * xpPerActivity,
    };
  }
}

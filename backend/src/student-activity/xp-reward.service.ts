import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserXpEvent } from '../community/entities/user-xp-event.entity';
import { UserDailyActivity } from './entities/user-daily-activity.entity';
import {
  XP_COMMUNITY_HELPFUL,
  XP_FLASHCARDS_BASE,
  XP_FLASHCARDS_STREAK,
  XP_FLASHCARDS_STREAK_MIN_DAYS,
  XP_QUIZ_BASE,
  XP_QUIZ_PERFECT,
  XP_SOURCES,
  XP_TEMPLATE_POPULAR,
  XP_TEMPLATE_POPULAR_MIN_DOWNLOADS,
  XP_WEEKLY_MULTIPLIER,
  XP_WEEKLY_STREAK_MIN_DAYS,
} from './xp-rewards.constants';

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseYmd(ymd: string): Date {
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day, 12, 0, 0, 0);
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

@Injectable()
export class XpRewardService {
  constructor(
    @InjectRepository(UserXpEvent)
    private readonly xpRepo: Repository<UserXpEvent>,
    @InjectRepository(UserDailyActivity)
    private readonly activityRepo: Repository<UserDailyActivity>,
  ) {}

  async isWeeklyStudyStreakActive(userId: string): Promise<boolean> {
    const todayYmd = toYmd(new Date());
    const weekStart = getMondayOfWeek(todayYmd);
    const weekEnd = addDaysYmd(weekStart, 6);
    const count = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.study = true')
      .andWhere('a.activity_date >= :weekStart', { weekStart })
      .andWhere('a.activity_date <= :weekEnd', { weekEnd })
      .getCount();
    return count >= XP_WEEKLY_STREAK_MIN_DAYS;
  }

  private async getStudyStreak(userId: string): Promise<number> {
    const todayYmd = toYmd(new Date());
    const lookbackStart = addDaysYmd(todayYmd, -120);
    const rows = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.study = true')
      .andWhere('a.activity_date >= :from', { from: lookbackStart })
      .getMany();
    const studySet = new Set(rows.map((r) => r.activityDate));
    return computeCurrentStreak(studySet, todayYmd);
  }

  private async applyWeeklyMultiplier(userId: string, baseAmount: number): Promise<number> {
    const active = await this.isWeeklyStudyStreakActive(userId);
    return active ? Math.round(baseAmount * XP_WEEKLY_MULTIPLIER) : baseAmount;
  }

  async awardUnique(
    userId: string,
    baseAmount: number,
    source: string,
    referenceId: string,
    applyWeeklyMultiplier = true,
  ): Promise<number> {
    if (baseAmount <= 0) return 0;
    const existing = await this.xpRepo.findOne({
      where: { userId, source, referenceId },
    });
    if (existing) return 0;

    const amount = applyWeeklyMultiplier
      ? await this.applyWeeklyMultiplier(userId, baseAmount)
      : baseAmount;

    await this.xpRepo.save({
      userId,
      amount,
      source,
      referenceId,
    });
    return amount;
  }

  async awardQuizComplete(
    userId: string,
    attemptId: string,
    correctCount: number,
    totalQuestions: number,
  ): Promise<number> {
    const perfect = totalQuestions > 0 && correctCount === totalQuestions;
    const base = perfect ? XP_QUIZ_PERFECT : XP_QUIZ_BASE;
    return this.awardUnique(userId, base, XP_SOURCES.QUIZ, attemptId);
  }

  async awardFlashcardSession(userId: string): Promise<number> {
    const todayYmd = toYmd(new Date());
    const streak = await this.getStudyStreak(userId);
    const base =
      streak >= XP_FLASHCARDS_STREAK_MIN_DAYS ? XP_FLASHCARDS_STREAK : XP_FLASHCARDS_BASE;
    return this.awardUnique(userId, base, XP_SOURCES.FLASHCARDS, todayYmd);
  }

  async awardCommunityAnswerHelpful(
    authorUserId: string,
    answerId: string,
  ): Promise<number> {
    return this.awardUnique(
      authorUserId,
      XP_COMMUNITY_HELPFUL,
      XP_SOURCES.COMMUNITY_HELPFUL,
      answerId,
    );
  }

  async awardTemplatePopularUse(authorUserId: string, templateId: string): Promise<number> {
    return this.awardUnique(
      authorUserId,
      XP_TEMPLATE_POPULAR,
      XP_SOURCES.TEMPLATE_POPULAR,
      templateId,
    );
  }
}

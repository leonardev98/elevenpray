/** Valores de la economía de XP — mantener alineados con frontend/data/gamification-config.ts */

export const XP_QUIZ_BASE = 50;
export const XP_QUIZ_PERFECT = 100;

export const XP_FLASHCARDS_BASE = 10;
export const XP_FLASHCARDS_STREAK = 30;
export const XP_FLASHCARDS_STREAK_MIN_DAYS = 5;

export const XP_COMMUNITY_HELPFUL = 100;

export const XP_TEMPLATE_POPULAR = 200;
export const XP_TEMPLATE_POPULAR_MIN_DOWNLOADS = 5;
export const XP_TEMPLATE_APPROVED = 200;

export const XP_REFERRAL = 500;

export const XP_WEEKLY_STREAK_MIN_DAYS = 5;
export const XP_WEEKLY_MULTIPLIER = 1.5;

export const XP_SOURCES = {
  QUIZ: 'quiz_complete',
  FLASHCARDS: 'flashcard_session',
  COMMUNITY_HELPFUL: 'community_answer_helpful',
  TEMPLATE_POPULAR: 'community_template_popular',
  TEMPLATE_APPROVED: 'community_template_approved',
  REFERRAL_REFEREE: 'referral_referee',
  REFERRAL_REFERRER: 'referral_referrer',
} as const;

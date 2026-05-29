const REFERRAL_PREFIX = 'MITSYY-';

export function referralCodeFromUserId(userId: string): string {
  const slice = userId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${REFERRAL_PREFIX}${slice || 'CAMPUS'}`;
}

export function parseReferralCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized.startsWith(REFERRAL_PREFIX)) return null;
  const suffix = normalized.slice(REFERRAL_PREFIX.length);
  if (!/^[A-F0-9]{6}$/.test(suffix)) return null;
  return suffix;
}

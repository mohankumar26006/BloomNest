/**
 * Clinical Pregnancy & Gestational Age Calculation Engine
 * Follows ACOG (American College of Obstetricians and Gynecologists) and Naegele's Rule.
 * Provides day-by-day real-time gestational progression.
 */

export interface PregnancyProgress {
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  currentWeek: number;
  dayOfCurrentWeek: number;
  gestationalAgeText: string;
  trimester: 1 | 2 | 3;
  progressPercent: number;
  edd: string;
}

/**
 * Normalizes any Date or date string to midnight local time
 */
export function normalizeToMidnight(dateInput?: string | Date): Date {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculates days remaining from an Estimated Due Date (EDD).
 * Automatically steps down by 1 every calendar day.
 */
export function calculateDaysRemainingFromEdd(eddStr?: string, fallbackWeek: number = 24): number {
  if (!eddStr) {
    const safeWeek = Math.min(42, Math.max(1, fallbackWeek));
    return Math.max(0, (40 - safeWeek) * 7);
  }

  const eddDate = normalizeToMidnight(eddStr);
  const today = normalizeToMidnight();
  const diffTime = eddDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If EDD is reasonably within a pregnancy window (0 to 300 days)
  if (!isNaN(diffDays) && diffDays >= 0 && diffDays <= 300) {
    return diffDays;
  }

  const safeWeek = Math.min(42, Math.max(1, fallbackWeek));
  return Math.max(0, (40 - safeWeek) * 7);
}

/**
 * Calculates EDD ISO string (YYYY-MM-DD) from a given gestational week as of today.
 */
export function calculateEddFromWeek(week: number): string {
  const safeWeek = Math.min(42, Math.max(1, week));
  const daysLeft = (40 - safeWeek) * 7;
  const target = normalizeToMidnight();
  target.setDate(target.getDate() + daysLeft);
  return target.toISOString().split("T")[0];
}

/**
 * Comprehensive day-by-day pregnancy progress calculator.
 * Guarantees that Navbar, Dashboard, Hero Progress, and Trackers display identical,
 * synchronized calculations that advance automatically day by day.
 */
export function calculatePregnancyProgress(user: {
  edd?: string;
  dueDate?: string;
  lmpDate?: string;
  currentWeek?: number;
  trimester?: number;
  daysRemaining?: number;
}): PregnancyProgress {
  const TOTAL_DAYS = 280; // 40 weeks * 7 days

  let activeEdd = user.edd || user.dueDate;
  const fallbackWeek = user.currentWeek || 24;

  // If no EDD exists, derive a stable EDD from currentWeek
  if (!activeEdd) {
    activeEdd = calculateEddFromWeek(fallbackWeek);
  }

  const daysRemaining = calculateDaysRemainingFromEdd(activeEdd, fallbackWeek);
  const daysElapsed = Math.min(TOTAL_DAYS, Math.max(0, TOTAL_DAYS - daysRemaining));

  // Day-by-day week and remainder day: e.g. 169 days = Week 24 + 1 day
  const currentWeek = Math.min(42, Math.max(1, Math.floor(daysElapsed / 7)));
  const dayOfCurrentWeek = daysElapsed % 7;

  const trimester: 1 | 2 | 3 = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / TOTAL_DAYS) * 100)));

  const gestationalAgeText =
    dayOfCurrentWeek > 0
      ? `Week ${currentWeek} + ${dayOfCurrentWeek}d`
      : `Week ${currentWeek}`;

  return {
    daysRemaining,
    daysElapsed,
    totalDays: TOTAL_DAYS,
    currentWeek,
    dayOfCurrentWeek,
    gestationalAgeText,
    trimester,
    progressPercent,
    edd: activeEdd,
  };
}

/**
 * Calculates EDD ISO string from Last Menstrual Period (LMP) date (Naegele's rule: LMP + 280 days).
 */
export function calculateEddFromLmp(lmpDateStr: string): string {
  const lmp = normalizeToMidnight(lmpDateStr);
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd.toISOString().split("T")[0];
}


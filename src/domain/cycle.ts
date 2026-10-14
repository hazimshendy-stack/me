import type { ScienceTrack, WeekCycle } from './types';

// Fixed patterns from the source. Do NOT flip days for RTL — the internal
// logic uses Sunday = 0 ... Saturday = 6 and matches the source order.
export const CYCLE_PATTERNS: Record<WeekCycle, ScienceTrack[]> = {
  A: ['Business', 'Technology', 'Science', 'Business', 'Technology'],
  B: ['Science', 'Business', 'Technology', 'Science', 'Business'],
  C: ['Technology', 'Science', 'Business', 'Technology', 'Science'],
};

/** Sunday..Thursday => 0..4 */
const FOCUSED_DAY_INDEX: Record<number, number | null> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: null,
  6: null,
};

/**
 * Given the cycle (A/B/C) and the day of week (0 = Sunday), return the
 * science track for that day, or null on Friday/Saturday.
 */
export function trackFor(cycle: WeekCycle, dayOfWeek: number): ScienceTrack | null {
  const idx = FOCUSED_DAY_INDEX[dayOfWeek];
  if (idx == null) return null;
  return CYCLE_PATTERNS[cycle][idx];
}

export function nextCycle(c: WeekCycle): WeekCycle {
  return c === 'A' ? 'B' : c === 'B' ? 'C' : 'A';
}

export function cycleIndex(c: WeekCycle): number {
  return c === 'A' ? 0 : c === 'B' ? 1 : 2;
}

/**
 * Count Business sessions that occur strictly before or on (week, dayOfWeek)
 * starting from a given (startCycle) anchor. Used to derive the sequential
 * business-function index across A/B/C cycles without resetting.
 */
export function businessSessionIndex(
  startCycle: WeekCycle,
  weeksElapsed: number,
  dayOfWeek: number,
): number | null {
  // Number of Business sessions in a full 15-session triple-week cycle is 6
  // (A: 2, B: 2, C: 2). Sessions per week: A[0,3]=2, B[1,4]=2, C[2,3]=2.
  const perCycle = 6;
  let count = 0;
  const fullCycles = Math.floor(weeksElapsed / 3);
  const remWeeks = weeksElapsed % 3;
  count += fullCycles * perCycle;

  // Simulate the current triple-cycle prefix.
  let c: WeekCycle = startCycle;
  for (let w = 0; w < remWeeks; w++) {
    const pattern = CYCLE_PATTERNS[c];
    count += pattern.filter((t) => t === 'Business').length;
    c = nextCycle(c);
  }

  // Current week: count Business sessions on earlier focused days + today.
  const todayIdx = FOCUSED_DAY_INDEX[dayOfWeek];
  if (todayIdx == null) return null;
  const pattern = CYCLE_PATTERNS[c];
  let todayCount = 0;
  for (let i = 0; i <= todayIdx; i++) {
    if (pattern[i] === 'Business') todayCount++;
  }
  // The current session index is count + todayCount - 1 (0-based).
  return count + todayCount - 1;
}

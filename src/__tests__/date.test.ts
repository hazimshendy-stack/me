import { describe, it, expect } from 'vitest';
import {
  toISODate,
  parseISODate,
  startOfWeekSunday,
  minutesFromHHMM,
  durationBetween,
  isFocusedDay,
} from '../utils/date';

describe('date utils', () => {
  it('round-trips ISO dates', () => {
    const d = new Date(2026, 9, 14); // Oct 14 2026
    expect(toISODate(d)).toBe('2026-10-14');
    expect(parseISODate('2026-10-14').getDate()).toBe(14);
  });
  it('startOfWeekSunday returns Sunday', () => {
    const wed = new Date(2026, 9, 14); // Wednesday
    const sunday = startOfWeekSunday(wed);
    expect(sunday.getDay()).toBe(0);
  });
  it('durationBetween', () => {
    expect(durationBetween('09:00', '10:30')).toBe(90);
    expect(durationBetween('10:00', '09:00')).toBeNull();
  });
  it('minutesFromHHMM validates', () => {
    expect(minutesFromHHMM('23:59')).toBe(23 * 60 + 59);
    expect(minutesFromHHMM('25:00')).toBeNull();
    expect(minutesFromHHMM('bad')).toBeNull();
  });
  it('isFocusedDay Sunday..Thursday', () => {
    for (let i = 0; i <= 4; i++) expect(isFocusedDay(new Date(2026, 9, 11 + i))).toBe(true);
    expect(isFocusedDay(new Date(2026, 9, 16))).toBe(false); // Friday
    expect(isFocusedDay(new Date(2026, 9, 17))).toBe(false); // Saturday
  });
});

import { describe, it, expect } from 'vitest';
import { COLLEGE_SUBJECTS, WEDNESDAY_ENGLISH_MINUTES, wednesdaySplit } from '../domain/college';

describe('college subjects', () => {
  it('maps each subject to the source day', () => {
    const byDay: Record<number, string> = {};
    for (const s of COLLEGE_SUBJECTS) byDay[s.day] = s.name;
    expect(byDay[0]).toBe('Abstract Algebra');
    expect(byDay[1]).toBe('Advanced Calculus');
    expect(byDay[2]).toBe('Introduction to Statistics');
    expect(byDay[3]).toBe('Computer Organization');
    expect(byDay[4]).toBe('Differential Equations');
  });
  it('Wednesday split is 75 + 45 minutes by default', () => {
    const s = wednesdaySplit('English');
    expect(s.primaryMinutes).toBe(75);
    expect(s.secondaryMinutes).toBe(45);
    expect(s.secondaryMinutes).toBe(WEDNESDAY_ENGLISH_MINUTES);
  });
});

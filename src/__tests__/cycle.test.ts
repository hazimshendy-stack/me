import { describe, it, expect } from 'vitest';
import { trackFor, nextCycle, CYCLE_PATTERNS, businessSessionIndex } from '../domain/cycle';
import type { WeekCycle } from '../domain/types';

describe('science A/B/C cycle', () => {
  it('Week A pattern matches source', () => {
    expect(CYCLE_PATTERNS.A).toEqual([
      'Business',
      'Technology',
      'Science',
      'Business',
      'Technology',
    ]);
  });
  it('Week B pattern matches source', () => {
    expect(CYCLE_PATTERNS.B).toEqual(['Science', 'Business', 'Technology', 'Science', 'Business']);
  });
  it('Week C pattern matches source', () => {
    expect(CYCLE_PATTERNS.C).toEqual([
      'Technology',
      'Science',
      'Business',
      'Technology',
      'Science',
    ]);
  });
  it('trackFor returns null on Friday and Saturday', () => {
    for (const c of ['A', 'B', 'C'] as WeekCycle[]) {
      expect(trackFor(c, 5)).toBeNull();
      expect(trackFor(c, 6)).toBeNull();
    }
  });
  it('nextCycle wraps A->B->C->A', () => {
    expect(nextCycle('A')).toBe('B');
    expect(nextCycle('B')).toBe('C');
    expect(nextCycle('C')).toBe('A');
  });
  it('business session index continues across cycles (does not reset)', () => {
    // Start at A week 0 Sunday -> index 0
    expect(businessSessionIndex('A', 0, 0)).toBe(0);
    // A Wed -> index 1
    expect(businessSessionIndex('A', 0, 3)).toBe(1);
    // B Mon -> index 2
    expect(businessSessionIndex('A', 1, 1)).toBe(2);
    // B Thu -> index 3
    expect(businessSessionIndex('A', 1, 4)).toBe(3);
    // C Tue -> index 4
    expect(businessSessionIndex('A', 2, 2)).toBe(4);
    // Week D (A again) Sun -> index 5
    expect(businessSessionIndex('A', 3, 0)).toBe(5);
    // Week D (A again) Wed -> index 6
    expect(businessSessionIndex('A', 3, 3)).toBe(6);
    // Then wraps
    expect(businessSessionIndex('A', 4, 0)).toBe(0);
  });
});

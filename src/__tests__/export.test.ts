import { describe, it, expect } from 'vitest';
import { parseImport, toCSV, toJSON } from '../utils/export';
import { buildDefaultState } from '../domain/defaults';
import type { AppState } from '../domain/types';

function sampleState(): AppState {
  const s = buildDefaultState();
  s.events.push({
    id: 'evt_1',
    title: 'جلسة علم — Business',
    pillar: 'Science',
    track: 'Business',
    date: '2026-10-18',
    startTime: '09:00',
    endTime: '12:00',
    durationMinutes: 180,
    flexible: false,
    status: 'not_started',
    outputs: 'Sooq first pass',
  });
  return s;
}

describe('export/import', () => {
  it('round-trips JSON', () => {
    const s = sampleState();
    const json = toJSON(s);
    const res = parseImport(json);
    expect(res.ok).toBe(true);
    expect(res.state!.events.length).toBe(1);
    expect(res.state!.events[0].title).toBe('جلسة علم — Business');
  });

  it('rejects invalid JSON', () => {
    const res = parseImport('{ not json');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/JSON/);
  });

  it('rejects JSON without events array', () => {
    const res = parseImport(JSON.stringify({ foo: 1 }));
    expect(res.ok).toBe(false);
  });

  it('produces CSV with header and quoted Arabic text', () => {
    const csv = toCSV(sampleState());
    const lines = csv.split('\n');
    expect(lines[0]).toMatch(/id,title,pillar/);
    expect(csv).toMatch(/"جلسة علم — Business"/);
  });
});

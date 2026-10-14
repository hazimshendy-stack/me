import type { AppState, CalendarEvent } from '../domain/types';
import { PILLAR_LABELS_AR } from '../domain/types';

export function toJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

function csvEscape(s: unknown): string {
  const v = s == null ? '' : String(s);
  const needs = /[",\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needs ? '"' + escaped + '"' : escaped;
}

export function toCSV(state: AppState): string {
  const header = [
    'id',
    'title',
    'pillar',
    'pillarAr',
    'track',
    'date',
    'startTime',
    'endTime',
    'durationMinutes',
    'actualMinutes',
    'status',
    'outputs',
    'blocker',
    'nextAction',
    'notes',
  ];
  const rows: string[] = [header.join(',')];
  const sorted = state.events
    .slice()
    .sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || '')));
  for (const e of sorted) {
    rows.push(
      [
        e.id,
        e.title,
        e.pillar,
        PILLAR_LABELS_AR[e.pillar],
        e.track || '',
        e.date,
        e.startTime || '',
        e.endTime || '',
        e.durationMinutes ?? '',
        e.actualMinutes ?? '',
        e.status,
        e.outputs || '',
        e.blocker || '',
        e.nextAction || '',
        e.notes || '',
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  return rows.join('\n');
}

const VALID_PILLARS = new Set([
  'Allah',
  'Health',
  'Admin',
  'Science',
  'Work',
  'College',
  'Project',
]);
const VALID_STATUS = new Set(['not_started', 'in_progress', 'done', 'deferred']);

export interface ImportResult {
  ok: boolean;
  state?: AppState;
  error?: string;
}

export function parseImport(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: 'JSON غير صالح: تعذر التحليل.' };
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'الملف لا يحتوي على كائن JSON صالح.' };
  }
  const obj = data as Record<string, unknown>;
  const events = obj.events;
  if (!Array.isArray(events)) {
    return { ok: false, error: 'الحقل events مفقود أو ليس مصفوفة.' };
  }
  const cleanEvents: CalendarEvent[] = [];
  for (const e of events) {
    if (!e || typeof e !== 'object') continue;
    const ev = e as Record<string, unknown>;
    if (typeof ev.title !== 'string') continue;
    if (typeof ev.pillar !== 'string' || !VALID_PILLARS.has(ev.pillar)) continue;
    if (typeof ev.date !== 'string') continue;
    const status =
      typeof ev.status === 'string' && VALID_STATUS.has(ev.status) ? ev.status : 'not_started';
    cleanEvents.push({
      id: typeof ev.id === 'string' ? ev.id : 'evt_' + Math.random().toString(36).slice(2),
      title: ev.title,
      pillar: ev.pillar as CalendarEvent['pillar'],
      track: typeof ev.track === 'string' ? ev.track : undefined,
      date: ev.date,
      startTime: typeof ev.startTime === 'string' ? ev.startTime : undefined,
      endTime: typeof ev.endTime === 'string' ? ev.endTime : undefined,
      durationMinutes: typeof ev.durationMinutes === 'number' ? ev.durationMinutes : undefined,
      flexible: Boolean(ev.flexible),
      outputs: typeof ev.outputs === 'string' ? ev.outputs : undefined,
      status: status as CalendarEvent['status'],
      notes: typeof ev.notes === 'string' ? ev.notes : undefined,
      blocker: typeof ev.blocker === 'string' ? ev.blocker : undefined,
      nextAction: typeof ev.nextAction === 'string' ? ev.nextAction : undefined,
      recurrence:
        ev.recurrence === 'daily' || ev.recurrence === 'weekly' || ev.recurrence === 'none'
          ? (ev.recurrence as CalendarEvent['recurrence'])
          : undefined,
      actualMinutes: typeof ev.actualMinutes === 'number' ? ev.actualMinutes : undefined,
    });
  }
  const project =
    obj.project && typeof obj.project === 'object' ? (obj.project as AppState['project']) : null;
  const settings =
    obj.settings && typeof obj.settings === 'object'
      ? (obj.settings as AppState['settings'])
      : undefined;
  const schemaVersion = typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 1;
  return {
    ok: true,
    state: {
      schemaVersion,
      events: cleanEvents,
      project,
      settings: settings as AppState['settings'],
    },
  };
}

export function download(filename: string, content: string, mime = 'application/json'): void {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

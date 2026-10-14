import type { AppState } from '../domain/types';
import { buildDefaultState, DEFAULT_SETTINGS, SCHEMA_VERSION } from '../domain/defaults';

const KEY = 'shendy-life-calendar:v1';

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = buildDefaultState();
    return {
      schemaVersion: SCHEMA_VERSION,
      events: Array.isArray(parsed.events) ? parsed.events : base.events,
      project: parsed.project ?? base.project,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
        targets: {
          ...DEFAULT_SETTINGS.targets,
          ...((parsed.settings && parsed.settings.targets) || {}),
        },
      },
    };
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable or full; never crash the UI for this.
  }
}

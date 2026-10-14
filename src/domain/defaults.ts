import type { AppState, Settings } from './types';

export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  targets: {
    allahHours: 3,
    healthAdminHours: 10,
    scienceHours: 3,
    workHours: 3,
    shendyPlusMinutes: 90,
    exploreMinutes: 90,
    collegeHours: 2,
    projectHours: 3,
  },
  cycleStart: 'A',
  englishPairing: 'English',
  showBudgetWarnings: true,
};

export function buildDefaultState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    events: [],
    project: null,
    settings: { ...DEFAULT_SETTINGS },
  };
}

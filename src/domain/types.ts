export type Pillar = 'Allah' | 'Health' | 'Admin' | 'Science' | 'Work' | 'College' | 'Project';

export type ScienceTrack = 'Business' | 'Technology' | 'Science';

export type EventStatus = 'not_started' | 'in_progress' | 'done' | 'deferred';

export type WeekCycle = 'A' | 'B' | 'C';

export interface CalendarEvent {
  id: string;
  title: string;
  pillar: Pillar;
  track?: string;
  date: string; // ISO yyyy-mm-dd
  startTime?: string; // HH:MM (24h)
  endTime?: string; // HH:MM
  durationMinutes?: number;
  flexible: boolean;
  outputs?: string;
  status: EventStatus;
  notes?: string;
  blocker?: string;
  nextAction?: string;
  recurrence?: 'none' | 'daily' | 'weekly';
  actualMinutes?: number;
  isTemplate?: boolean;
}

export interface ActiveProject {
  name: string;
  description: string;
  completionCriteria: string;
  weeklyDeliverable: string;
  progress?: number;
  nextAction: string;
}

export interface Settings {
  targets: {
    allahHours: number;
    healthAdminHours: number;
    scienceHours: number;
    workHours: number;
    shendyPlusMinutes: number;
    exploreMinutes: number;
    collegeHours: number;
    projectHours: number;
  };
  cycleStart: WeekCycle;
  englishPairing: string;
  showBudgetWarnings: boolean;
}

export interface AppState {
  schemaVersion: number;
  events: CalendarEvent[];
  project: ActiveProject | null;
  settings: Settings;
}

export const PILLARS: Pillar[] = [
  'Allah',
  'Health',
  'Admin',
  'Science',
  'Work',
  'College',
  'Project',
];

export const PILLAR_LABELS_AR: Record<Pillar, string> = {
  Allah: 'الله',
  Health: 'الصحة',
  Admin: 'الإدارة',
  Science: 'العلم',
  Work: 'العمل',
  College: 'الكلية',
  Project: 'المشاريع',
};

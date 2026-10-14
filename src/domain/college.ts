export interface CollegeSubject {
  day: number; // 0 = Sunday ... 6 = Saturday
  name: string;
  nameAr: string;
  defaultMinutes: number;
}

// Provisional distribution. The 2h/day figure and the Wednesday pairing
// are assumptions and are configurable.
export const COLLEGE_SUBJECTS: CollegeSubject[] = [
  { day: 0, name: 'Abstract Algebra', nameAr: 'جبر مجرد', defaultMinutes: 120 },
  { day: 1, name: 'Advanced Calculus', nameAr: 'تفاضل عالي', defaultMinutes: 120 },
  { day: 2, name: 'Introduction to Statistics', nameAr: 'مقدمة إحصاء', defaultMinutes: 120 },
  { day: 3, name: 'Computer Organization', nameAr: 'تنظيم حاسب', defaultMinutes: 75 },
  { day: 4, name: 'Differential Equations', nameAr: 'معادلات تفاضلية', defaultMinutes: 120 },
];

export const WEDNESDAY_ENGLISH_MINUTES = 45;

export function wednesdaySplit(englishPairing: string): {
  primaryName: string;
  primaryMinutes: number;
  secondaryName: string;
  secondaryMinutes: number;
} {
  return {
    primaryName: 'Computer Organization',
    primaryMinutes: 75,
    secondaryName: englishPairing || 'English',
    secondaryMinutes: WEDNESDAY_ENGLISH_MINUTES,
  };
}

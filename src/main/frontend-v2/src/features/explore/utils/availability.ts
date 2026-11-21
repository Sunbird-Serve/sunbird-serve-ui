import type { VolunteerProfile } from '../api/exploreApi';

export const DAY_CODES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export type TimeBucket = 'morning' | 'afternoon' | 'evening';

// "Monday", "mon", "MON" -> "Mon"
export function dayCode(value: string): string | null {
  const v = value.trim().toLowerCase();
  return DAY_CODES.find((c) => v.startsWith(c.toLowerCase())) ?? null;
}

// "Morning", "morning (9-12)" -> "morning"
export function timeBucket(value: string): TimeBucket | null {
  const v = value.trim().toLowerCase();
  if (v.includes('morn')) return 'morning';
  if (v.includes('after')) return 'afternoon';
  if (v.includes('even')) return 'evening';
  return null;
}

export interface Availability {
  days: string[];
  times: TimeBucket[];
}

// The days and times of day a volunteer has said they are available.
export function availabilityOf(profile?: VolunteerProfile | null): Availability {
  const days = (profile?.userPreference?.dayPreferred ?? [])
    .map(dayCode)
    .filter((d): d is string => d !== null);
  const times = (profile?.userPreference?.timePreferred ?? [])
    .map(timeBucket)
    .filter((t): t is TimeBucket => t !== null);
  return { days: [...new Set(days)], times: [...new Set(times)] };
}

export function hasAvailability(a: Availability): boolean {
  return a.days.length > 0 || a.times.length > 0;
}

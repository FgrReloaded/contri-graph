import type { ContributionDay } from "@/types/contributions";

export interface LongestStreak {
  length: number;
  start: string | null;
  end: string | null;
}

export interface FirstMostActive {
  firstDay: ContributionDay | null;
  mostActiveDay: ContributionDay | null;
}

export interface VelocityMetrics {
  rollingAverage7d: number;
  weeklyCadence: number;
}

export function computeLongestStreak(days: ContributionDay[]): LongestStreak {
  if (!days || days.length === 0) return { length: 0, start: null, end: null };

  const sorted = [...days]
    .filter(d => d.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let bestLen = 0;
  let bestStart: string | null = null;
  let bestEnd: string | null = null;

  let curLen = 0;
  let curStart: string | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i];
    if ((day.count || 0) > 0) {
      if (curLen === 0) curStart = day.date;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
        bestEnd = day.date;
      }
    } else {
      curLen = 0;
      curStart = null;
    }
  }

  return { length: bestLen, start: bestStart, end: bestEnd };
}

export function computeFirstAndMostActive(days: ContributionDay[]): FirstMostActive {
  if (!days || days.length === 0) return { firstDay: null, mostActiveDay: null };

  const sorted = [...days]
    .filter(d => d.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const firstDay = sorted.find(d => (d.count || 0) > 0) || null;

  let mostActiveDay: ContributionDay | null = null;
  for (const d of sorted) {
    if (!mostActiveDay || (d.count || 0) > (mostActiveDay.count || 0)) {
      mostActiveDay = d;
    }
  }

  return { firstDay, mostActiveDay };
}



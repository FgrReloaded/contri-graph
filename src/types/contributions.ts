export interface ContributionDay {
  date: string;
  count: number;
  color: string;
  intensity: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface YearlyContributions {
  year: string;
  total: number;
  range: DateRange;
  contributions: ContributionDay[];
}

export interface YearlySummary {
  year: string;
  total: number;
  range: DateRange;
}

export interface NestedContributions {
  [year: number]: {
    [month: number]: {
      [day: number]: ContributionDay;
    };
  };
}

export interface AllYearsData {
  years: YearlySummary[] | { [year: string]: YearlySummary };
  contributions: ContributionDay[] | NestedContributions;
}

export interface YearLink {
  href: string;
  text: string;
}

export type ContributionFormat = 'flat' | 'nested';

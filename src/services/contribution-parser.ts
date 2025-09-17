import type * as cheerio from 'cheerio';
import { CONTRIBUTION_COLORS } from '@/constants/github';
import type {
  ContributionDay,
  YearlyContributions,
  YearlySummary,
  NestedContributions,
  AllYearsData,
  ContributionFormat
} from '@/types/contributions';

function parseContributionCount(document: cheerio.CheerioAPI): number {
  const contributionText = document('.js-yearly-contributions h2')
    .text()
    .trim();

  const match = contributionText.match(/^([0-9,]+)\s/);
  if (!match) return 0;

  return parseInt(match[1].replace(/,/g, ''), 10);
}

function extractContributionDays(document: cheerio.CheerioAPI): unknown[] {
  return document('table.ContributionCalendar-grid td.ContributionCalendar-day')
    .toArray();
}

function parseContributionDay(
  element: unknown,
  document: cheerio.CheerioAPI,
  index: number,
  totalContributions: number
): ContributionDay {
  const dayElement = document(element as any);
  const date = dayElement.attr('data-date');
  const level = dayElement.attr('data-level');
  const id = dayElement.attr('id');

  if (!date || level === undefined) {
    throw new Error('Required contribution day attributes missing');
  }

  const intensity = parseInt(level, 10);
  const color = CONTRIBUTION_COLORS[intensity as keyof typeof CONTRIBUTION_COLORS];

  let count = 0;
  if (id) {
    const label = document(`[for="${id}"]`).text().trim();
    if (label) {
      const match = label.match(/(\d{1,3}(?:,\d{3})*|\d+)\s+contribution/i);
      if (match) {
        count = parseInt(match[1].replace(/,/g, ''), 10);
      }
    }
  }

  return {
    date,
    count,
    color,
    intensity
  };
}

export function parseYearContributions(
  document: cheerio.CheerioAPI,
  year: string
): YearlyContributions {
  const totalContributions = parseContributionCount(document);
  const contributionDays = extractContributionDays(document);

  if (contributionDays.length === 0) {
    throw new Error('No contribution days found');
  }

  const firstDay = document(contributionDays[0] as any);
  const lastDay = document(contributionDays[contributionDays.length - 1] as any);

  const startDate = firstDay.attr('data-date');
  const endDate = lastDay.attr('data-date');

  if (!startDate || !endDate) {
    throw new Error('Date range information missing');
  }

  const parsedContributions = contributionDays.map((day, index) =>
    parseContributionDay(day, document, index, totalContributions)
  );

  return {
    year,
    total: totalContributions,
    range: {
      start: startDate,
      end: endDate
    },
    contributions: parsedContributions
  };
}

function formatFlatData(yearlyData: YearlyContributions[]): AllYearsData {
  const allContributions = yearlyData
    .flatMap(year => year.contributions)
    .sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });

  const years: YearlySummary[] = yearlyData.map(({ contributions, ...yearInfo }) => yearInfo);

  return {
    years,
    contributions: allContributions
  };
}

function formatNestedData(yearlyData: YearlyContributions[]): AllYearsData {
  const nestedYears: { [year: string]: YearlySummary } = {};
  const nestedContributions: NestedContributions = {};

  for (const yearData of yearlyData) {
    const { contributions, ...yearInfo } = yearData;

    nestedYears[yearInfo.year] = yearInfo;

    const yearContributions = contributions.reduce((accumulator, contribution) => {
      const [year, month, day] = contribution.date
        .split('-')
        .map(part => parseInt(part, 10));

      if (!accumulator[year]) accumulator[year] = {};
      if (!accumulator[year][month]) accumulator[year][month] = {};

      accumulator[year][month][day] = contribution;
      return accumulator;
    }, {} as NestedContributions);

    for (const year in yearContributions) {
      const yearNum = parseInt(year, 10);
      if (!nestedContributions[yearNum]) nestedContributions[yearNum] = {};

      for (const month in yearContributions[yearNum]) {
        const monthNum = parseInt(month, 10);
        if (!nestedContributions[yearNum][monthNum]) nestedContributions[yearNum][monthNum] = {};

        Object.assign(nestedContributions[yearNum][monthNum], yearContributions[yearNum][monthNum]);
      }
    }
  }

  return {
    years: nestedYears,
    contributions: nestedContributions
  };
}

export function formatAllYearsData(
  yearlyData: YearlyContributions[],
  format: ContributionFormat
): AllYearsData {
  if (format === 'nested') {
    return formatNestedData(yearlyData);
  }

  return formatFlatData(yearlyData);
}

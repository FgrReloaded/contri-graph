import { parseYearContributions, formatAllYearsData } from './contribution-parser';
import { getAvailableYears, getContributionData } from './github-scraper';
import type { AllYearsData, YearlyContributions, ContributionFormat } from '@/types/contributions';

export async function getUserContributions(
  username: string,
  format: ContributionFormat = 'flat'
): Promise<AllYearsData> {
  try {
    const availableYears = await getAvailableYears(username);

    if (availableYears.length === 0) {
      throw new Error(`No contribution data found for user: ${username}`);
    }

    const yearlyDataPromises = availableYears.map(async (yearLink) => {
      const document = await getContributionData(yearLink.href);
      return parseYearContributions(document, yearLink.text);
    });

    const yearlyData = await Promise.all(yearlyDataPromises);
    return formatAllYearsData(yearlyData, format);
  } catch (error) {
    throw new Error(
      `Failed to fetch contributions for ${username}: ${error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function getYearContributions(
  username: string,
  year: string
): Promise<YearlyContributions> {
  try {
    const availableYears = await getAvailableYears(username);
    const targetYear = availableYears.find(y => y.text === year);

    if (!targetYear) {
      throw new Error(`Year ${year} not found for user: ${username}`);
    }

    const document = await getContributionData(targetYear.href);
    return parseYearContributions(document, year);
  } catch (error) {
    throw new Error(
      `Failed to fetch ${year} contributions for ${username}: ${error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function getUserAvailableYears(username: string): Promise<string[]> {
  try {
    const years = await getAvailableYears(username);
    return years.map(year => year.text);
  } catch (error) {
    throw new Error(
      `Failed to fetch available years for ${username}: ${error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

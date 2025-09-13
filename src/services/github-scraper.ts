import * as cheerio from 'cheerio';
import { GITHUB_BASE_URL, DEFAULT_HEADERS } from '@/constants/github';
import type { YearLink } from '@/types/contributions';

async function fetchPage(url: string): Promise<cheerio.CheerioAPI> {
  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    return cheerio.load(html);
  } catch (error) {
    throw new Error(`Error fetching ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAvailableYears(username: string): Promise<YearLink[]> {
  const url = `${GITHUB_BASE_URL}/${username}?tab=contributions`;
  const document = await fetchPage(url);

  return document('.js-year-link.filter-item')
    .toArray()
    .map((element) => {
      const linkElement = document(element);
      const href = linkElement.attr('href');

      if (!href) {
        throw new Error('Year link href not found');
      }

      const githubUrl = new URL(`${GITHUB_BASE_URL}${href}`);
      githubUrl.searchParams.set('tab', 'contributions');

      return {
        href: `${githubUrl.pathname}${githubUrl.search}`,
        text: linkElement.text().trim()
      };
    });
}

export async function getContributionData(url: string): Promise<cheerio.CheerioAPI> {
  return fetchPage(`${GITHUB_BASE_URL}${url}`);
}

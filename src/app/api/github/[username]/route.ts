import type { NextRequest } from 'next/server';
import { getUserContributions, getYearContributions } from '@/services/github-contribution-service';
import type { ContributionFormat } from '@/types/contributions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);

    const year = searchParams.get('year');
    const format = (searchParams.get('format') || 'flat') as ContributionFormat;

    if (year) {
      const yearContributions = await getYearContributions(username, year);
      return Response.json(yearContributions);
    }

    const allContributions = await getUserContributions(username, format);
    return Response.json(allContributions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
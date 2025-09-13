import { getUserAvailableYears } from '@/services/github-contribution-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const availableYears = await getUserAvailableYears(username);

    return Response.json({ years: availableYears });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

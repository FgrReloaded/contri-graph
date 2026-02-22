import type { NextRequest } from 'next/server';
import { getYearContributions } from '@/services/github-contribution-service';
import type { ContributionDay } from '@/types/contributions';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const INTENSITY_CHARS = ['·', '░', '▒', '▓', '█'];

const COLORS: Record<string, { fg: string; dim: string }> = {
  green:  { fg: '\x1b[32m', dim: '\x1b[2;32m' },
  blue:   { fg: '\x1b[34m', dim: '\x1b[2;34m' },
  purple: { fg: '\x1b[35m', dim: '\x1b[2;35m' },
  orange: { fg: '\x1b[33m', dim: '\x1b[2;33m' },
  yellow: { fg: '\x1b[93m', dim: '\x1b[2;93m' },
  pink:   { fg: '\x1b[95m', dim: '\x1b[2;95m' },
  cyan:   { fg: '\x1b[36m', dim: '\x1b[2;36m' },
  white:  { fg: '\x1b[37m', dim: '\x1b[2;37m' },
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function getWeeksGrid(contributions: ContributionDay[]): ContributionDay[][] {
  if (contributions.length === 0) return [];

  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (let i = 0; i < contributions.length; i++) {
    const day = contributions[i];
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    if (i === 0) {
      for (let j = 0; j < dayOfWeek; j++) {
        currentWeek.push({ date: '', count: 0, color: '', intensity: 0 });
      }
    }

    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0, color: '', intensity: 0 });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function getMonthLabels(weeks: ContributionDay[][]): string {
  const labelPadding = '     '; // align with day labels
  const monthPositions: { month: number; col: number }[] = [];

  for (let w = 0; w < weeks.length; w++) {
    for (const day of weeks[w]) {
      if (day.date) {
        const month = new Date(day.date).getMonth();
        if (!monthPositions.find(m => m.month === month)) {
          monthPositions.push({ month, col: w });
        }
        break;
      }
    }
  }

  let line = labelPadding;
  let pos = 0;

  for (const { month, col } of monthPositions) {
    const label = MONTHS[month];
    const targetPos = col;
    while (pos < targetPos) {
      line += ' ';
      pos++;
    }
    line += label;
    pos += label.length;
  }

  return line;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);

    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const color = searchParams.get('color') || 'green';
    const compact = searchParams.get('compact') === 'true';

    const palette = COLORS[color] || COLORS.green;

    const yearData = await getYearContributions(username, year);
    const contributions = yearData.contributions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
    const weeks = getWeeksGrid(contributions);

    const lines: string[] = [];

    // Header
    lines.push('');
    lines.push(
      `  ${palette.fg}${BOLD}@${username}${RESET} ${DIM}—${RESET} ${BOLD}${totalContributions.toLocaleString()}${RESET} ${DIM}contributions in ${year}${RESET}`
    );
    lines.push('');

    // Month labels
    lines.push(`  ${DIM}${getMonthLabels(weeks)}${RESET}`);

    // Grid rows (7 days, each row spans all weeks)
    const rowIndices = compact ? [1, 3, 5] : [0, 1, 2, 3, 4, 5, 6];

    for (const dayIndex of rowIndices) {
      const dayLabel = compact ? DAYS[dayIndex].charAt(0) : DAYS[dayIndex];
      let row = `  ${DIM}${dayLabel}${RESET}  `;

      for (const week of weeks) {
        const day = week[dayIndex];
        if (!day) {
          row += ' ';
          continue;
        }

        const intensity = Math.max(0, Math.min(4, day.intensity));
        const char = INTENSITY_CHARS[intensity];

        if (intensity === 0) {
          row += `${DIM}${char}${RESET}`;
        } else {
          row += `${palette.fg}${char}${RESET}`;
        }
      }

      lines.push(row);
    }

    // Legend
    lines.push('');
    lines.push(
      `  ${DIM}Less${RESET} ${DIM}${INTENSITY_CHARS[0]}${RESET}${palette.fg}${INTENSITY_CHARS[1]}${INTENSITY_CHARS[2]}${INTENSITY_CHARS[3]}${INTENSITY_CHARS[4]}${RESET} ${DIM}More${RESET}    ${DIM}cg.nitishk.dev${RESET}`
    );
    lines.push('');

    const output = lines.join('\n');

    return new Response(output, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(`Error: ${errorMessage}\n`, { status: 500 });
  }
}

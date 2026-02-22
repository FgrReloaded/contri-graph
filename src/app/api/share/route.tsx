import type { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import { getUserContributions } from '@/services/github-contribution-service';
import type { ContributionDay } from '@/types/contributions';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getWeeksInYear(items: ContributionDay[]): ContributionDay[][] {
  if (items.length === 0) return [];

  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  items.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    if (index === 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: 0, color: '#ebedf0', intensity: 0 });
      }
    }

    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0, color: '#ebedf0', intensity: 0 });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get('username');
    const year = searchParams.get('year');
    const baseColor = searchParams.get('baseColor') || '10b981';
    const size = Number.parseInt(searchParams.get('size') || '12', 10);
    const gap = Number.parseInt(searchParams.get('gap') || '2', 10);
    const shape = searchParams.get('shape') || 'rounded';
    const minOpacity = Number.parseFloat(searchParams.get('minOpacity') || '0.1');
    const maxOpacity = Number.parseFloat(searchParams.get('maxOpacity') || '1');

    if (!username || !year) {
      return new Response('Missing username or year parameter', { status: 400 });
    }

    const allContributions = await getUserContributions(username, 'flat');
    const contributions = Array.isArray(allContributions.contributions)
      ? allContributions.contributions
      : [];

    const yearContributions = contributions
      .filter(day => day.date.startsWith(year))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalContributions = yearContributions.reduce((sum, day) => sum + day.count, 0);
    const weeks = getWeeksInYear(yearContributions);

    const r = Number.parseInt(baseColor.slice(0, 2), 16);
    const g = Number.parseInt(baseColor.slice(2, 4), 16);
    const b = Number.parseInt(baseColor.slice(4, 6), 16);

    const stops = [0, 1, 2, 3, 4].map((i) => minOpacity + (i * (maxOpacity - minOpacity)) / 4);

    const getColor = (day: ContributionDay) => {
      if (!day.date) return 'rgba(200, 200, 200, 0.1)';
      const level = Math.max(0, Math.min(4, day.intensity));
      return `rgba(${r}, ${g}, ${b}, ${stops[level]})`;
    };

    const leftPadding = 20;
    const topPadding = 50;
    const graphWidth = weeks.length * (size + gap) + leftPadding * 2;
    const graphHeight = 7 * (size + gap) + topPadding + 40;

    const imgWidth = Math.max(graphWidth, 800);
    const imgHeight = Math.max(graphHeight + 20, 200);

    const borderRadius = shape === 'circle' ? '50%' : shape === 'square' ? '0px' : '3px';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            padding: `${leftPadding}px`,
          }}
        >
          <div style={{ display: 'flex', fontSize: 16, color: '#586069', marginBottom: 8 }}>
            {totalContributions.toLocaleString()} contributions in {year}
          </div>

          <div style={{ display: 'flex', marginBottom: 6, marginTop: 4 }}>
            {MONTHS.map((month) => (
              <span
                key={month}
                style={{
                  fontSize: 11,
                  color: '#586069',
                  width: `${(weeks.length * (size + gap)) / 12}px`,
                }}
              >
                {month}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
            {weeks.map((week, weekIndex) => (
              <div
                key={`w-${weekIndex}-${week.join('-')}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginRight: `${gap}px`,
                }}
              >
                {week.map((day, dayIndex) => (
                  <div
                    key={`d-${weekIndex}-${dayIndex}-${day.date}`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      marginBottom: `${gap}px`,
                      backgroundColor: getColor(day),
                      borderRadius,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: 11,
              color: '#aaa',
              marginTop: 8,
            }}
          >
            cg.nitishk.dev
          </div>
        </div>
      ),
      {
        width: imgWidth,
        height: imgHeight,
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}

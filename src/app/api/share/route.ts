import type { NextRequest } from 'next/server';
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

function generateGraphSVG(
  weeks: ContributionDay[][],
  username: string,
  year: string,
  totalContributions: number,
  config: {
    size: number;
    gap: number;
    baseColor: string;
    shape: string;
    minOpacity: number;
    maxOpacity: number;
  }
): string {
  const { size, gap, baseColor, shape, minOpacity, maxOpacity } = config;

  const r = parseInt(baseColor.slice(0, 2), 16);
  const g = parseInt(baseColor.slice(2, 4), 16);
  const b = parseInt(baseColor.slice(4, 6), 16);

  const stops = [0, 1, 2, 3, 4].map((i) => minOpacity + (i * (maxOpacity - minOpacity)) / 4);

  const getColor = (day: ContributionDay) => {
    if (!day.date) return 'rgba(16, 185, 129, 0.08)';
    const level = Math.max(0, Math.min(4, day.intensity));
    return `rgba(${r}, ${g}, ${b}, ${stops[level]})`;
  };

  const getShapeElement = (x: number, y: number, color: string, title: string) => {
    const commonAttrs = `x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"`;

    if (shape === 'square') {
      return `<rect ${commonAttrs} rx="0"><title>${title}</title></rect>`;
    }
    if (shape === 'circle') {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size / 2;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"><title>${title}</title></circle>`;
    }
    return `<rect ${commonAttrs} rx="4"><title>${title}</title></rect>`;
  };

  const monthLabelHeight = 20;
  const graphStartY = monthLabelHeight + 10;
  const weekWidth = size;
  const dayHeight = size;
  const graphWidth = weeks.length * (weekWidth + gap) + 40;
  const graphHeight = (7 * dayHeight) + (6 * gap) + graphStartY + 80;

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${graphWidth}" height="${graphHeight}" viewBox="0 0 ${graphWidth} ${graphHeight}" xmlns="http://www.w3.org/2000/svg" role="img">
  <style>
    .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; }
    .stat { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #586069; }
    .month-label { font: 400 10px 'Segoe UI', Ubuntu, Sans-Serif; fill: #586069; }
  </style>

  <rect width="100%" height="100%" fill="#ffffff"/>

  <text x="20" y="25" class="header">${username}'s Contributions in ${year}</text>
  <text x="20" y="45" class="stat">${totalContributions} contributions</text>

  <g transform="translate(20, ${graphStartY})">
    ${MONTHS.map((month, i) => {
    const x = (i * graphWidth / 12) - 20;
    return `<text x="${x}" y="0" class="month-label">${month}</text>`;
  }).join('\n    ')}
  </g>

  <g transform="translate(20, ${graphStartY + 20})">
    ${weeks.map((week, weekIndex) => {
    const weekX = weekIndex * (weekWidth + gap);
    return week.map((day, dayIndex) => {
      const dayY = dayIndex * (dayHeight + gap);
      const color = getColor(day);
      const dateStr = day.date ? new Date(day.date).toDateString() : 'empty';
      const title = `${dateStr}${day.count > 0 ? `: ${day.count} contributions` : ''}`;

      return getShapeElement(weekX, dayY, color, title);
    }).join('\n    ');
  }).join('\n    ')}
  </g>
</svg>`;

  return svgContent;
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

    const svg = generateGraphSVG(weeks, username, year, totalContributions, {
      size,
      gap,
      baseColor,
      shape,
      minOpacity,
      maxOpacity,
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(`Error: ${errorMessage}`, { status: 500 });
  }
}


'use client';

import { useMemo, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { ContributionDay, AllYearsData } from '@/types/contributions';

export type DotShape = 'square' | 'rounded' | 'circle' | 'diamond' | 'hex';

interface ContributionGraphProps {
  data: AllYearsData;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  colorScale?: string[]; // length 5 (0..4)
  shape?: DotShape;
  size?: number; // px
  gap?: number; // px
  showMonths?: boolean;
  showWeekdays?: boolean;
  showLegend?: boolean;
  showYearSelector?: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SCALE = ['#ECEEF4', '#BEE3D8', '#7DD3C7', '#34B3A0', '#0E8A77'];

export function ContributionGraph({
  data,
  selectedYear,
  onYearChange,
  colorScale = DEFAULT_SCALE,
  shape = 'rounded',
  size = 12,
  gap = 2,
  showMonths = true,
  showWeekdays = false,
  showLegend = true,
  showYearSelector = true,
}: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const contributions = Array.isArray(data.contributions)
    ? data.contributions
    : [];

  const years = Array.isArray(data.years)
    ? data.years.map(y => y.year)
    : Object.keys(data.years);

  const currentYearContributions = useMemo(() => {
    const list = selectedYear
      ? contributions.filter(day => day.date.startsWith(selectedYear))
      : contributions.slice(0, 365);
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [contributions, selectedYear]);

  const getWeeksInYear = useCallback((items: ContributionDay[]) => {
    if (items.length === 0) return [] as ContributionDay[][];

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
  }, []);

  const weeks = useMemo(() => getWeeksInYear(currentYearContributions), [currentYearContributions, getWeeksInYear]);

  const dotShapeStyle = useMemo(() => {
    if (shape === 'circle') return { borderRadius: 9999 } as const;
    if (shape === 'square') return { borderRadius: 2 } as const;
    if (shape === 'rounded') return { borderRadius: 4 } as const;
    if (shape === 'diamond') return { clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' } as const;
    if (shape === 'hex') return { clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%)' } as const;
    return {} as const;
  }, [shape]);

  const getColor = (day: ContributionDay | null) => {
    if (!day || !day.date) return colorScale[0] ?? '#ECEEF4';
    const idx = Math.max(0, Math.min(colorScale.length - 1, day.intensity));
    return colorScale[idx] ?? colorScale[0] ?? '#ECEEF4';
  };

  const legendScale = colorScale.slice(0, 5);
  const dotStyleBase: CSSProperties = { width: size, height: size, ...dotShapeStyle };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900/90">Contribution Activity</h3>
        {showYearSelector && years.length > 1 && (
          <select
            value={selectedYear || years[0]}
            onChange={(e) => onYearChange?.(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="relative min-w-fit">
        {showMonths && (
          <div className="flex mb-2">
            <div className="" style={{ width: showWeekdays ? 24 : 0 }} />
            <div className="flex-1 grid grid-cols-12 gap-0">
              {MONTHS.map((month) => (
                <div key={month} className="text-[11px] text-gray-600/80 text-center select-none">
                  {month}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex">
          {showWeekdays && (
            <div className="flex flex-col justify-between items-end pr-2 select-none" style={{ paddingTop: 0, paddingBottom: 0 }}>
              {[0, 2, 4].map((i) => (
                <div key={WEEKDAYS[i]} className="text-[11px] leading-none text-gray-500/80" style={{ height: size + gap }}>
                  {WEEKDAYS[i]}
                </div>
              ))}
            </div>
          )}

          <div className="flex min-w-fit" style={{ gap }}>
            {weeks.map((week, weekIndex) => {
              const firstDayOfWeek = week.find(d => d.date)?.date || `week-${weekIndex}`;
              return (
                <div key={firstDayOfWeek} className="flex flex-col" style={{ gap }}>
                  {week.map((day, dayIndex) => (
                    <button
                      key={day.date || `empty-${weekIndex}-${dayIndex}`}
                      type="button"
                      className="border-0 p-0 focus:outline-none focus:ring-2 focus:ring-teal-400/60 hover:brightness-110"
                      style={{ ...dotStyleBase, backgroundColor: getColor(day) }}
                      onMouseEnter={(e) => {
                        if (day.date) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                          if (containerRect) {
                            setMousePosition({ x: rect.left - containerRect.left + rect.width / 2, y: rect.top - containerRect.top });
                          }
                          setHoveredDay(day);
                        }
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      disabled={!day.date}
                      aria-label={day.date ? `${day.date} – level ${day.intensity}` : 'empty'}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {showLegend && (
          <div className="flex items-center justify-between mt-3 text-xs text-gray-600/90 select-none">
            <span>Less</span>
            <div className="flex" style={{ gap }}>
              {legendScale.map((c) => (
                <div key={c} className="shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" style={{ ...dotShapeStyle, width: size, height: size, backgroundColor: c }} />
              ))}
            </div>
            <span>More</span>
          </div>
        )}

        {hoveredDay && (
          <div
            className="absolute bg-gray-900/95 text-white text-xs px-2 py-1 rounded z-10 transform -translate-x-1/2 -translate-y-full whitespace-nowrap shadow-lg"
            style={{ left: mousePosition.x, top: mousePosition.y - 6 }}
          >
            {new Date(hoveredDay.date).toDateString()} · level {hoveredDay.intensity}
          </div>
        )}
      </div>
    </div>
  );
}

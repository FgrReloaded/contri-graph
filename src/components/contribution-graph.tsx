'use client';

import { useMemo, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { ContributionDay, AllYearsData } from '@/types/contributions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GraphAppearance } from '@/types/graph-appearance';

type DotShape = 'rounded';

interface ContributionGraphProps {
  data: AllYearsData;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  appearance?: GraphAppearance;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function ContributionGraph({
  data,
  selectedYear,
  onYearChange,
  appearance,
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

  const size = appearance?.size ?? 12;
  const gap = appearance?.gap ?? 2;
  const shape = appearance?.shape ?? 'rounded';
  const minOpacity = appearance?.minOpacity ?? 0.15;
  const maxOpacity = appearance?.maxOpacity ?? 1;
  const baseHex = appearance?.baseColor ?? '#10b981';

  const dotShapeStyle: CSSProperties = useMemo(() => {
    if (shape === 'square') return { borderRadius: 0 };
    if (shape === 'circle') return { borderRadius: 9999 };
    return { borderRadius: 4 };
  }, [shape]);
  const getColor = (day: ContributionDay | null) => {
    if (!day || !day.date) return 'rgba(16, 185, 129, 0.08)';
    const level = Math.max(0, Math.min(4, day.intensity));
    const stops = [0, 1, 2, 3, 4].map((i) => minOpacity + (i * (maxOpacity - minOpacity)) / 4);
    const alpha = stops[level];
    // Convert base hex to rgb
    const r = parseInt(baseHex.slice(1, 3), 16);
    const g = parseInt(baseHex.slice(3, 5), 16);
    const b = parseInt(baseHex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const dotStyleBase: CSSProperties = { width: size, height: size, ...dotShapeStyle };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-4 p-1">
        <h3 className="text-lg font-semibold">Contribution Activity</h3>
        {years.length > 1 && (
          <Select value={selectedYear || years[0]} onValueChange={(v) => onYearChange?.(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="relative min-w-fit">
        <div className="flex mb-2">
          <div className="flex-1 grid grid-cols-12 gap-0">
            {MONTHS.map((month) => (
              <div key={month} className="text-[11px] text-gray-600/80 text-center select-none">
                {month}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
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
                      aria-label={day.date ? `${day.date} –` : 'empty'}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600/90 select-none">
          <span className="text-gray-500">Intensity increases with darker shade</span>
        </div>

        {hoveredDay && (
          <div
            className="absolute bg-gray-900/95 text-white text-xs px-2 py-1 rounded z-10 transform -translate-x-1/2 -translate-y-full whitespace-nowrap shadow-lg"
            style={{ left: mousePosition.x, top: mousePosition.y - 6 }}
          >
            {new Date(hoveredDay.date).toDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

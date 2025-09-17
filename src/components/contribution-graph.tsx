'use client';

import { useMemo, useState, useCallback } from 'react';
import type { CSSProperties, Ref } from 'react';
import type { ContributionDay, AllYearsData, YearlySummary } from '@/types/contributions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserBadge from '@/components/user-badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useGraphAppearanceStore } from '@/store/graph-appearance';
import { Button } from './ui/button';
import { useGraphViewStore } from '@/store/graph-view';
import { ContributionBarChart } from './charts/contribution-bar-chart';
import { ContributionAreaChart } from './charts/contribution-area-chart';
import { ContributionLineChart } from './charts/contribution-line-chart';
import { ContributionRadarChart } from './charts/contribution-radar-chart';
import { ContributionPieChart } from './charts/contribution-pie-chart';
import { ContributionRadialChart } from './charts/contribution-radial-chart';

interface ContributionGraphProps {
  data: AllYearsData;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  user?: { id: string; avatar_url: string; name: string | null } | null;
  exportRef?: Ref<HTMLDivElement>;
  showTotal?: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function ContributionGraph({
  data,
  selectedYear,
  onYearChange,
  user,
  exportRef,
  showTotal = true,
}: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mode = useGraphViewStore((s) => s.mode)
  const chartType = useGraphViewStore((s) => s.chartType)

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

  const appearance = useGraphAppearanceStore((s) => s.appearance);
  const size = appearance.size;
  const gap = appearance.gap;
  const shape = appearance.shape;
  const minOpacity = appearance.minOpacity;
  const maxOpacity = appearance.maxOpacity;
  const baseHex = appearance.baseColor;

  const dotShapeStyle: CSSProperties = useMemo(() => {
    if (shape === 'square') return { borderRadius: 0 };
    if (shape === 'circle') return { borderRadius: 9999 };
    if (shape === 'diamond') return { borderRadius: 0, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
    if (shape === 'triangle') return { borderRadius: 0, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' };
    if (shape === 'hexagon') return { borderRadius: 0, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' };
    return { borderRadius: 4 };
  }, [shape]);

  const getColor = (day: ContributionDay | null) => {
    if (!day || !day.date) return 'rgba(16, 185, 129, 0.08)';
    const level = Math.max(0, Math.min(4, day.intensity));
    const stops = [0, 1, 2, 3, 4].map((i) => minOpacity + (i * (maxOpacity - minOpacity)) / 4);
    const alpha = stops[level];

    const r = parseInt(baseHex.slice(1, 3), 16);
    const g = parseInt(baseHex.slice(3, 5), 16);
    const b = parseInt(baseHex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const dotStyleBase: CSSProperties = { width: size, height: size, ...dotShapeStyle };

  const yearTotal = useMemo(() => {
    if (!selectedYear) return null;
    const y = data.years;
    if (Array.isArray(y)) {
      const found = (y as YearlySummary[]).find((ys) => ys.year === selectedYear);
      return found?.total ?? null;
    }
    const summary = (y as { [year: string]: YearlySummary })[selectedYear];
    return summary?.total ?? null;
  }, [data.years, selectedYear]);

  return (
    <ScrollArea className="w-full">
      <div className="flex items-center justify-between mb-4 p-1 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Contribution Activity</h3>
        </div>
        {years.length > 1 && (
          <Select value={selectedYear || years[0]} onValueChange={(v) => onYearChange?.(v)}>
            <SelectTrigger className="min-w-[110px]">
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
      {mode === 'chart' && chartType === 'bar' ? (
        <div ref={exportRef as any} className="relative pb-6" data-export="contribution-graph">
          <div className="px-1 pt-1 flex items-center justify-between">
            <div>
              {user && (
                <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
              )}
            </div>
            {showTotal && yearTotal !== null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
            )}
          </div>
          <ContributionBarChart contributions={currentYearContributions} />
        </div>
      ) : mode === 'chart' && chartType === 'area' ? (
        <div ref={exportRef as any} className="relative pb-6" data-export="contribution-graph">
          <div className="px-1 pt-1 flex items-center justify-between">
            <div>
              {user && (
                <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
              )}
            </div>
            {showTotal && yearTotal !== null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
            )}
          </div>
          <ContributionAreaChart contributions={currentYearContributions} />
        </div>
      ) : mode === 'chart' && chartType === 'line' ? (
        <div ref={exportRef as any} className="relative pb-6" data-export="contribution-graph">
          <div className="px-1 pt-1 flex items-center justify-between">
            <div>
              {user && (
                <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
              )}
            </div>
            {showTotal && yearTotal !== null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
            )}
          </div>
          <ContributionLineChart contributions={currentYearContributions} />
        </div>
      ) : mode === 'chart' && chartType === 'radar' ? (
        <div ref={exportRef as any} className="relative pb-6" data-export="contribution-graph">
          <div className="px-1 pt-1 flex items-center justify-between">
            <div>
              {user && (
                <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
              )}
            </div>
            {showTotal && yearTotal !== null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
            )}
          </div>
          <ContributionRadarChart contributions={currentYearContributions} />
        </div>
      ) : mode === 'chart' && chartType === 'pie' ? (
        <div ref={exportRef as any} className="relative pb-6" data-export="contribution-graph">
          <div className="px-1 pt-1 flex items-center justify-between">
            <div>
              {user && (
                <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
              )}
            </div>
            {showTotal && yearTotal !== null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
            )}
          </div>
          <ContributionPieChart contributions={currentYearContributions} />
        </div>
      ) : mode === 'chart' && chartType === 'radial' ? (
        <div ref={exportRef as any} className="relative pb-6" data-export="contribution-graph">
          <div className="px-1 pt-1 flex items-center justify-between">
            <div>
              {user && (
                <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
              )}
            </div>
            {showTotal && yearTotal !== null && (
              <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
            )}
          </div>
          <ContributionRadialChart contributions={currentYearContributions} />
        </div>
      ) : (
      <div ref={exportRef as any} className="relative min-w-fit pb-6" data-export="contribution-graph">
        <div className="px-1 pt-1 flex items-center justify-between">
          <div>
            {user && (
              <UserBadge avatarUrl={user.avatar_url} name={user.name} id={user.id} />
            )}
          </div>
          {showTotal && yearTotal !== null && (
            <span className="text-sm text-gray-600 dark:text-gray-400">{yearTotal} contributions</span>
          )}
        </div>
        <div className="flex mb-2 overflow-x-auto">
          <div className="flex-1 grid grid-cols-12 gap-0 min-w-[600px]">
            {MONTHS.map((month) => (
              <div key={month} className="text-[11px] text-gray-600/80 text-center select-none">
                {month}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center overflow-x-auto">
          <div className="flex min-w-fit" style={{ gap }}>
            {weeks.map((week, weekIndex) => {
              const firstDayOfWeek = week.find(d => d.date)?.date || `week-${weekIndex}`;
              return (
                <div key={firstDayOfWeek} className="flex flex-col" style={{ gap }}>
                  {week.map((day, dayIndex) => (
                    <Button
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

        {hoveredDay && (
          <div
            className="absolute bg-gray-900/95 text-white text-xs px-2 py-1 rounded z-10 transform -translate-x-1/2 -translate-y-full whitespace-nowrap shadow-lg"
            style={{ left: mousePosition.x, top: mousePosition.y - 6 }}
          >
            {new Date(hoveredDay.date).toDateString()}
          </div>
        )}
      </div>
      )}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

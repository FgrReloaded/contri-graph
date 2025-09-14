'use client';

import { useState } from 'react';
import type { ContributionDay, AllYearsData } from '@/types/contributions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
interface ContributionGraphProps {
  data: AllYearsData;
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ContributionGraph({ data, selectedYear, onYearChange }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const contributions = Array.isArray(data.contributions)
    ? data.contributions
    : [];

  const years = Array.isArray(data.years)
    ? data.years.map(y => y.year)
    : Object.keys(data.years);

  const currentYearContributions = selectedYear
    ? contributions.filter(day => day.date.startsWith(selectedYear)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : contributions.slice(0, 365).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getWeeksInYear = (contributions: ContributionDay[]) => {
    if (contributions.length === 0) return [];

    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    contributions.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();

      if (index === 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({
            date: '',
            count: 0,
            color: '#ebedf0',
            intensity: 0
          });
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
        currentWeek.push({
          date: '',
          count: 0,
          color: '#ebedf0',
          intensity: 0
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = getWeeksInYear(currentYearContributions);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Contribution Activity
        </h3>
        {years.length > 1 && (
          <select
            value={selectedYear || years[0]}
            onChange={(e) => onYearChange?.(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      <div className="relative min-w-fit">
        <div className="flex mb-2">
          <div className="w-8"></div>
          <div className="flex-1 grid grid-cols-12 gap-0">
            {MONTHS.map((month, index) => (
              <div key={month} className="text-xs text-gray-600 text-center">
                {index % 2 === 0 ? month : ''}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          <div className="flex gap-1 min-w-fit">
            {weeks.map((week, weekIndex) => {
              const firstDayOfWeek = week.find(d => d.date)?.date || `week-${weekIndex}`;
              return (
                <div key={firstDayOfWeek} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <button
                      key={day.date || `empty-${weekIndex}-${dayIndex}`}
                      type="button"
                      className="w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-gray-400 border-0 p-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: day.date ? day.color : '#ebedf0',
                        opacity: day.date ? 1 : 0.5
                      }}
                      onMouseEnter={(e) => {
                        if (day.date) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                          if (containerRect) {
                            setMousePosition({
                              x: rect.left - containerRect.left + rect.width / 2,
                              y: rect.top - containerRect.top
                            });
                          }
                          setHoveredDay(day);
                        }
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      disabled={!day.date}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'][level]
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>

        {hoveredDay && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: mousePosition.x,
              top: mousePosition.y - 4
            }}
          >
            <div>{new Date(hoveredDay.date).toDateString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

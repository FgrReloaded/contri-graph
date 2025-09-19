'use client';

import { useMemo } from 'react';
import type { ContributionDay } from '@/types/contributions';
import type { ChartType } from '@/store/graph-view';
import { ContributionBarChart } from '../charts/contribution-bar-chart';
import { ContributionAreaChart } from '../charts/contribution-area-chart';
import { ContributionLineChart } from '../charts/contribution-line-chart';
import { ContributionRadarChart } from '../charts/contribution-radar-chart';
import { ContributionPieChart } from '../charts/contribution-pie-chart';
import { ContributionRadialChart } from '../charts/contribution-radial-chart';

interface ContributionChartProviderProps {
  chartType: ChartType;
  contributions: ContributionDay[];
  children: (ChartComponent: React.ComponentType<{ contributions: ContributionDay[] }>) => React.ReactNode;
}

export function ContributionChartProvider({ 
  chartType, 
  children 
}: ContributionChartProviderProps) {
  const ChartComponent = useMemo(() => {
    const chartMap: Record<ChartType, React.ComponentType<{ contributions: ContributionDay[] }>> = {
      bar: ContributionBarChart,
      area: ContributionAreaChart,
      line: ContributionLineChart,
      radar: ContributionRadarChart,
      pie: ContributionPieChart,
      radial: ContributionRadialChart,
    };

    return chartMap[chartType];
  }, [chartType]);

  return <>{children(ChartComponent)}</>;
}

export function useContributionChart(chartType: ChartType) {
  return useMemo(() => {
    const chartMap: Record<ChartType, React.ComponentType<{ contributions: ContributionDay[] }>> = {
      bar: ContributionBarChart,
      area: ContributionAreaChart,
      line: ContributionLineChart,
      radar: ContributionRadarChart,
      pie: ContributionPieChart,
      radial: ContributionRadialChart,
    };

    return chartMap[chartType];
  }, [chartType]);
}

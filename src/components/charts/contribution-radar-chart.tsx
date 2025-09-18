"use client"

import type { ContributionDay } from "@/types/contributions";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGraphAppearanceStore } from "@/store/graph-appearance";


interface ContributionRadarChartProps {
  contributions: ContributionDay[];
}

export function ContributionRadarChart({ contributions }: ContributionRadarChartProps) {
  const baseColor = useGraphAppearanceStore((s) => s.appearance.baseColor)

  const monthly = useMemo(() => {
    const buckets: { [monthIdx: number]: number } = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0 }
    for (const d of contributions) {
      if (!d.date) continue
      const dt = new Date(d.date)
      if (Number.isNaN(dt.getTime())) continue
      const m = dt.getMonth()
      buckets[m] = (buckets[m] || 0) + (d.count || 0)
    }
    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" }),
      contributions: buckets[i] || 0,
    }))
  }, [contributions])

  const chartConfig = useMemo<ChartConfig>(() => ({
    contributions: { label: "Contributions", color: baseColor },
  }), [baseColor])

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px] w-full">
      <RadarChart data={monthly}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarAngleAxis dataKey="month" />
        <PolarGrid />
        <Radar
          dataKey="contributions"
          fill={baseColor}
          fillOpacity={0.6}
          dot={{ r: 3, fillOpacity: 1 }}
        />
      </RadarChart>
    </ChartContainer>
  )
}



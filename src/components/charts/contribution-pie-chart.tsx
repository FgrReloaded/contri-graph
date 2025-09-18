"use client"

import type { ContributionDay } from "@/types/contributions";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGraphAppearanceStore } from "@/store/graph-appearance";

interface ContributionPieChartProps {
  contributions: ContributionDay[];
}

export function ContributionPieChart({ contributions }: ContributionPieChartProps) {
  const baseColor = useGraphAppearanceStore((s) => s.appearance.baseColor)
  const minOpacity = useGraphAppearanceStore((s) => s.appearance.minOpacity)
  const maxOpacity = useGraphAppearanceStore((s) => s.appearance.maxOpacity)

  const generateColor = (index: number) => {
    const totalSegments = 12
    const clampedMin = Math.max(0, Math.min(1, minOpacity))
    const clampedMax = Math.max(0, Math.min(1, maxOpacity))
    const range = Math.max(0, clampedMax - clampedMin)
    const t = totalSegments > 1 ? index / (totalSegments - 1) : 0
    const opacity = Math.max(0, Math.min(1, clampedMin + range * t))
    const alpha = Math.max(0, Math.min(255, Math.round(opacity * 255)))
    return `${baseColor}${alpha.toString(16).padStart(2, '0')}`
  }
  

  const monthlyData = useMemo(() => {
    const buckets: { [monthIdx: number]: number } = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0 }
    for (const d of contributions) {
      if (!d.date) continue
      const dt = new Date(d.date)
      if (Number.isNaN(dt.getTime())) continue
      const m = dt.getMonth()
      buckets[m] = (buckets[m] || 0) + (d.count || 0)
    }
    
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    
    return monthNames.map((month, i) => ({
      key: month.toLowerCase(),
      label: month,
      contributions: buckets[i] || 0,
      fill: generateColor(i)
    })).filter(item => item.contributions > 0)
  }, [contributions, baseColor, minOpacity, maxOpacity])

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {
      contributions: { label: "Contributions" }
    }
    
    const monthNames = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ]
    
    monthNames.forEach((month, i) => {
      config[month] = {
        label: month.charAt(0).toUpperCase() + month.slice(1),
        color: `var(--chart-${(i % 5) + 1})`
      }
    })
    
    return config
  }, [])

  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[280px] w-full"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={monthlyData}
          dataKey="contributions"
          nameKey="label"
          label={({ name, value }) => `${name} • ${value}`}
        />
      </PieChart>
    </ChartContainer>
  )
}

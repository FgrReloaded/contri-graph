"use client"

import type { ContributionDay } from "@/types/contributions";
import { useMemo } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useGraphAppearanceStore } from "@/store/graph-appearance";

interface ContributionBarChartProps {
  contributions: ContributionDay[];
}

export function ContributionBarChart({ contributions }: ContributionBarChartProps) {
  const baseHex = useGraphAppearanceStore((s) => s.appearance.baseColor)

  const monthlyData = useMemo(() => {
    const buckets: { [monthIdx: number]: number } = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0 }
    for (const d of contributions) {
      if (!d.date) continue
      const dt = new Date(d.date)
      if (Number.isNaN(dt.getTime())) continue
      const m = dt.getMonth()
      buckets[m] = (buckets[m] || 0) + (d.count || 0)
    }
    return Array.from({ length: 12 }, (_, i) => {
      const label = new Date(2000, i, 1).toLocaleDateString("en-US", { month: "short" })
      return { month: label, value: buckets[i] || 0 }
    })
  }, [contributions])

  return (
    <ChartContainer
      config={{
        value: { label: "Contributions", color: baseHex },
      }}
      className="aspect-auto h-[280px] w-full"
    >
      <BarChart accessibilityLayer data={monthlyData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(v) => v as string}
        />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px]"
              nameKey="value"
              labelFormatter={(value) => String(value)}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="value" fill={`var(--color-value)`} radius={4} />
      </BarChart>
    </ChartContainer>
  )
}



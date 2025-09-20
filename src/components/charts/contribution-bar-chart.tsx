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
import { useGraphViewStore, type BarChartVariant } from "@/store/graph-view";

interface ContributionBarChartProps {
  contributions: ContributionDay[];
}

export function ContributionBarChart({ contributions }: ContributionBarChartProps) {
  const baseHex = useGraphAppearanceStore((s) => s.appearance.baseColor)
  const chartVariant = useGraphViewStore((s) => s.chartVariant)
  const barVariant = chartVariant.type === "bar" ? chartVariant.variant : "default"

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

  const stackedData = useMemo(() => {
    return monthlyData.map((item, i) => ({
      ...item,
      desktop: Math.floor(item.value * 0.6),
      mobile: Math.floor(item.value * 0.4),
    }))
  }, [monthlyData])

  const chartConfig = useMemo(() => {
    const config: any = {
      value: { label: "Contributions", color: baseHex },
    }
    
    if (barVariant === "stacked" || barVariant === "grouped") {
      config.desktop = { label: "Desktop", color: baseHex }
      config.mobile = { label: "Mobile", color: `${baseHex}80` }
    }
    
    return config
  }, [baseHex, barVariant])

  const renderBarChart = () => {
    switch (barVariant) {
      case "stacked":
        return (
          <BarChart accessibilityLayer data={stackedData} margin={{ left: 12, right: 12 }}>
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
            <Bar dataKey="desktop" stackId="a" fill={`var(--color-desktop)`} radius={[0, 0, 4, 4]} />
            <Bar dataKey="mobile" stackId="a" fill={`var(--color-mobile)`} radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case "grouped":
        return (
          <BarChart accessibilityLayer data={stackedData} margin={{ left: 12, right: 12 }}>
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
            <Bar dataKey="desktop" fill={`var(--color-desktop)`} radius={4} />
            <Bar dataKey="mobile" fill={`var(--color-mobile)`} radius={4} />
          </BarChart>
        )

      case "horizontal":
        return (
          <BarChart accessibilityLayer data={monthlyData} layout="horizontal" margin={{ left: 12, right: 12 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} width={40} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => v as string}
            />
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
        )

      default:
        return (
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
        )
    }
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full"
    >
      {renderBarChart()}
    </ChartContainer>
  )
}



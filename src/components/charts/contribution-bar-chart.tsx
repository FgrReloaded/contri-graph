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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
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


  const chartConfig = useMemo(() => {
    const config: any = {
      value: { label: "Contributions", color: baseHex },
    }
    
    if (barVariant === "month-labelled") {
      config.label = { color: "var(--background)" }
    }
    
    return config
  }, [baseHex, barVariant])

  const renderBarChart = () => {
    switch (barVariant) {

      case "horizontal":
        return (
          <BarChart accessibilityLayer data={monthlyData} layout="vertical" margin={{ left: -20 }}>
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill={`var(--color-value)`} radius={5} />
          </BarChart>
        )

      case "label":
        return (
          <BarChart
            accessibilityLayer
            data={monthlyData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" fill={`var(--color-value)`} radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        )

      case "month-labelled":
        return (
          <BarChart
            accessibilityLayer
            data={monthlyData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              layout="vertical"
              fill={`var(--color-value)`}
              radius={4}
            >
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
              />
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
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



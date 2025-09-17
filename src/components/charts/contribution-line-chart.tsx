"use client"

import type { ContributionDay } from "@/types/contributions";
import { useMemo, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useGraphAppearanceStore } from "@/store/graph-appearance";

interface ContributionLineChartProps {
  contributions: ContributionDay[];
}

export function ContributionLineChart({ contributions }: ContributionLineChartProps) {
  const baseHex = useGraphAppearanceStore((s) => s.appearance.baseColor)
  const [dataKey] = useState("count")

  const data = useMemo(() => {
    const sorted = [...contributions]
      .filter(d => d.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({ date: d.date, count: d.count || 0 }))
    return sorted
  }, [contributions])

  return (
    <ChartContainer
      config={{ [dataKey]: { label: "Contributions", color: baseHex } }}
      className="aspect-auto h-[280px] w-full"
    >
      <LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value as string)
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px]"
              nameKey={dataKey}
              labelFormatter={(value) =>
                new Date(value as string).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
          }
        />
        <Line dataKey={dataKey} type="monotone" stroke={`var(--color-${dataKey})`} strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}



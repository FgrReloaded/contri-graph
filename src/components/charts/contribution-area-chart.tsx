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
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useGraphAppearanceStore } from "@/store/graph-appearance";

interface ContributionAreaChartProps {
  contributions: ContributionDay[];
}

export function ContributionAreaChart({ contributions }: ContributionAreaChartProps) {
  const baseHex = useGraphAppearanceStore((s) => s.appearance.baseColor)

  const data = useMemo(() => {
    const sorted = [...contributions].filter(d => d.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(d => ({ date: d.date, count: d.count || 0 }));
  }, [contributions]);

  return (
    <ChartContainer
      config={{ count: { label: "Contributions", color: baseHex } }}
      className="aspect-auto h-[280px] w-full"
    >
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <defs>
          <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const dt = new Date(value as string)
            return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value as string).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
              indicator="dot"
            />
          }
        />
        <Area dataKey="count" type="natural" fill="url(#fillCount)" stroke="var(--color-count)" />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}



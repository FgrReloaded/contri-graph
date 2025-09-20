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
import { useGraphViewStore } from "@/store/graph-view";

interface ContributionAreaChartProps {
  contributions: ContributionDay[];
}

export function ContributionAreaChart({ contributions }: ContributionAreaChartProps) {
  const baseHex = useGraphAppearanceStore((s) => s.appearance.baseColor)
  const chartVariant = useGraphViewStore((s) => s.chartVariant)
  const areaVariant = chartVariant.type === "area" ? chartVariant.variant : "default"

  const data = useMemo(() => {
    const sorted = [...contributions].filter(d => d.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(d => ({ date: d.date, count: d.count || 0 }));
  }, [contributions]);

  const stackedData = useMemo(() => {
    return data.map((item, i) => ({
      ...item,
      desktop: Math.floor(item.count * 0.6),
      mobile: Math.floor(item.count * 0.4),
    }))
  }, [data])

  const chartConfig = useMemo(() => {
    const config: any = {
      count: { label: "Contributions", color: baseHex },
    }
    
    if (areaVariant === "stacked") {
      config.desktop = { label: "Desktop", color: baseHex }
      config.mobile = { label: "Mobile", color: `${baseHex}80` }
    }
    
    return config
  }, [baseHex, areaVariant])

  const renderAreaChart = () => {
    switch (areaVariant) {
      case "stacked":
        return (
          <AreaChart data={stackedData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
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
            <Area dataKey="desktop" type="natural" fill="url(#fillDesktop)" stroke="var(--color-desktop)" stackId="1" />
            <Area dataKey="mobile" type="natural" fill="url(#fillMobile)" stroke="var(--color-mobile)" stackId="1" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        )

      case "gradient":
        return (
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.9} />
                <stop offset="50%" stopColor="var(--color-count)" stopOpacity={0.5} />
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
            <Area dataKey="count" type="natural" fill="url(#fillCount)" stroke="var(--color-count)" strokeWidth={3} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        )

      case "smooth":
        return (
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
            <Area dataKey="count" type="monotone" fill="url(#fillCount)" stroke="var(--color-count)" strokeWidth={2} />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        )

      default:
        return (
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
        )
    }
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full"
    >
      {renderAreaChart()}
    </ChartContainer>
  )
}



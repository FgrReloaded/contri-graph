"use client"

import type { ContributionDay } from "@/types/contributions";
import { useMemo, useState, useEffect } from "react";
import { Pie, PieChart, Sector, Label } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGraphAppearanceStore } from "@/store/graph-appearance";
import { useGraphViewStore } from "@/store/graph-view";

interface ContributionPieChartProps {
  contributions: ContributionDay[];
}

export function ContributionPieChart({ contributions }: ContributionPieChartProps) {
  const baseColor = useGraphAppearanceStore((s) => s.appearance.baseColor)
  const minOpacity = useGraphAppearanceStore((s) => s.appearance.minOpacity)
  const maxOpacity = useGraphAppearanceStore((s) => s.appearance.maxOpacity)
  const chartVariant = useGraphViewStore((s) => s.chartVariant)
  const pieVariant = chartVariant.type === "pie" ? chartVariant.variant : "default"

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

  const stackedData = useMemo(() => {
    const innerData = monthlyData.map((item, i) => ({
      ...item,
      innerValue: Math.floor(item.contributions * 0.6),
      fill: generateColor(i)
    }))
    
    const outerData = monthlyData.map((item, i) => ({
      ...item,
      outerValue: Math.floor(item.contributions * 0.4),
      fill: generateColor(i)
    }))
    
    return { innerData, outerData }
  }, [monthlyData, baseColor, minOpacity, maxOpacity])

  const currentMonthIndex = useMemo(() => {
    const currentMonth = new Date().getMonth()
    return monthlyData.findIndex(item => {
      const monthNames = [
        "jan", "feb", "mar", "apr", "may", "jun",
        "jul", "aug", "sep", "oct", "nov", "dec"
      ]
      return item.key === monthNames[currentMonth]
    })
  }, [monthlyData])

  const [activeIndex, setActiveIndex] = useState(currentMonthIndex >= 0 ? currentMonthIndex : 0)

  useEffect(() => {
    if (currentMonthIndex >= 0) {
      setActiveIndex(currentMonthIndex)
    }
  }, [currentMonthIndex])

  const totalContributions = useMemo(() => {
    return monthlyData.reduce((acc, curr) => acc + curr.contributions, 0)
  }, [monthlyData])

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

  const renderPieChart = () => {
    switch (pieVariant) {
      case "stacked":
        return (
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="contributions"
                  nameKey="label"
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const data = payload?.[0]?.payload
                    return data?.label || "Unknown"
                  }}
                />
              }
            />
            <Pie data={stackedData.innerData} dataKey="innerValue" nameKey="label" outerRadius={60} />
            <Pie
              data={stackedData.outerData}
              dataKey="outerValue"
              nameKey="label"
              innerRadius={70}
              outerRadius={90}
            />
          </PieChart>
        )

      case "interactive":
        return (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={monthlyData}
              dataKey="contributions"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalContributions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Contributions
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        )

      case "donut":
        return (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={monthlyData}
              dataKey="contributions"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
  return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalContributions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Contributions
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        )

      default:
        return (
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={monthlyData}
          dataKey="contributions"
          nameKey="label"
          label={({ name, value }) => `${name} • ${value}`}
        />
      </PieChart>
        )
    }
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[280px] w-full"
    >
      {renderPieChart()}
    </ChartContainer>
  )
}

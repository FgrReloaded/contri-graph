"use client";

import { create } from "zustand";

export type GraphViewMode = "grid" | "grid-3d" | "chart";
export type ChartType = "bar" | "area" | "line" | "pie" | "radar" | "radial";

export type PieChartVariant = "default" | "stacked" | "interactive" | "donut";
export type BarChartVariant = "default" | "stacked" | "grouped" | "horizontal";
export type AreaChartVariant = "default" | "stacked" | "gradient" | "smooth";
export type LineChartVariant = "default" | "smooth" | "stepped" | "dashed";
export type RadarChartVariant = "default" | "lines-only" | "grid-filled" | "grid-circle-filled" | "grid-none";
export type RadialChartVariant = "default" | "progress" | "multi" | "gauge";

export type ChartVariant = 
  | { type: "pie"; variant: PieChartVariant }
  | { type: "bar"; variant: BarChartVariant }
  | { type: "area"; variant: AreaChartVariant }
  | { type: "line"; variant: LineChartVariant }
  | { type: "radar"; variant: RadarChartVariant }
  | { type: "radial"; variant: RadialChartVariant };

interface GraphViewState {
  mode: GraphViewMode;
  chartType: ChartType;
  chartVariant: ChartVariant;
  setMode: (mode: GraphViewMode) => void;
  setChartType: (type: ChartType) => void;
  setChartVariant: (variant: ChartVariant) => void;
}

export const useGraphViewStore = create<GraphViewState>((set) => ({
  mode: "grid",
  chartType: "bar",
  chartVariant: { type: "bar", variant: "default" },
  setMode: (mode) => set({ mode }),
  setChartType: (chartType) => set({ 
    chartType,
    chartVariant: { type: chartType, variant: "default" }
  }),
  setChartVariant: (chartVariant) => set({ chartVariant }),
}));



"use client";

import { create } from "zustand";

export type GraphViewMode = "grid" | "chart";
export type ChartType = "bar" | "area" | "line" | "pie" | "radar" | "radial";

interface GraphViewState {
  mode: GraphViewMode;
  chartType: ChartType;
  setMode: (mode: GraphViewMode) => void;
  setChartType: (type: ChartType) => void;
}

export const useGraphViewStore = create<GraphViewState>((set) => ({
  mode: "grid",
  chartType: "bar",
  setMode: (mode) => set({ mode }),
  setChartType: (chartType) => set({ chartType }),
}));



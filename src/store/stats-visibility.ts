"use client";

import { create } from "zustand";

export interface StatsVisibilityState {
  showStreaks: boolean;
  showFirstMost: boolean;
  showTotal: boolean;
  setShowStreaks: (v: boolean) => void;
  setShowFirstMost: (v: boolean) => void;
  setShowTotal: (v: boolean) => void;
}

export const useStatsVisibilityStore = create<StatsVisibilityState>((set) => ({
  showStreaks: true,
  showFirstMost: true,
  showTotal: true,
  setShowStreaks: (v) => set({ showStreaks: v }),
  setShowFirstMost: (v) => set({ showFirstMost: v }),
  setShowTotal: (v) => set({ showTotal: v }),
}));



"use client";

import { create } from "zustand";
import type { GraphAppearance } from "@/types/graph-appearance";
import { defaultGraphAppearance } from "@/types/graph-appearance";

interface GraphAppearanceState {
  appearance: GraphAppearance;
  setAppearance: (next: GraphAppearance) => void;
  setBaseColor: (hex: string) => void;
  setMinOpacity: (value: number) => void;
  setMaxOpacity: (value: number) => void;
  setSize: (value: number) => void;
  setGap: (value: number) => void;
  setShape: (value: GraphAppearance["shape"]) => void;
  setBase3DColor: (hex: string) => void;
  setViewAngleDeg: (deg: number) => void;
  setTiltDeg: (deg: number) => void;
  setCameraAngleX: (angle: number) => void;
  setCameraAngleY: (angle: number) => void;
  setCameraAngleZ: (angle: number) => void;
  setCameraAngles: (x: number, y: number, z: number) => void;
}

export const useGraphAppearanceStore = create<GraphAppearanceState>((set) => ({
  appearance: defaultGraphAppearance,
  setAppearance: (next) => set({ appearance: next }),
  setBaseColor: (hex) =>
    set((state) => ({
      appearance: { ...state.appearance, baseColor: hex },
    })),
  setMinOpacity: (value) =>
    set((state) => ({
      appearance: { ...state.appearance, minOpacity: value },
    })),
  setMaxOpacity: (value) =>
    set((state) => ({
      appearance: { ...state.appearance, maxOpacity: value },
    })),
  setSize: (value) =>
    set((state) => ({
      appearance: { ...state.appearance, size: value },
    })),
  setGap: (value) =>
    set((state) => ({
      appearance: { ...state.appearance, gap: value },
    })),
  setShape: (value) =>
    set((state) => ({
      appearance: { ...state.appearance, shape: value },
    })),
  setBase3DColor: (hex) =>
    set((state) => ({
      appearance: { ...state.appearance, base3DColor: hex },
    })),
  setViewAngleDeg: (deg) =>
    set((state) => ({
      appearance: { ...state.appearance, viewAngleDeg: deg },
    })),
  setTiltDeg: (deg) =>
    set((state) => ({
      appearance: { ...state.appearance, tiltDeg: deg },
    })),
  setCameraAngleX: (angle) =>
    set((state) => ({
      appearance: { ...state.appearance, cameraAngleX: angle },
    })),
  setCameraAngleY: (angle) =>
    set((state) => ({
      appearance: { ...state.appearance, cameraAngleY: angle },
    })),
  setCameraAngleZ: (angle) =>
    set((state) => ({
      appearance: { ...state.appearance, cameraAngleZ: angle },
    })),
  setCameraAngles: (x, y, z) =>
    set((state) => ({
      appearance: { ...state.appearance, cameraAngleX: x, cameraAngleY: y, cameraAngleZ: z },
    })),
}));

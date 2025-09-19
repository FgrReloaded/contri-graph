'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ContributionDay } from '@/types/contributions';
import { useGraphAppearanceStore } from '@/store/graph-appearance';
import { useTheme } from 'next-themes';

declare global {
  interface Window {
    obelisk?: any;
  }
}

interface ContributionGraph3DProps {
  contributions: ContributionDay[];
  width?: number;
  height?: number;
}

export default function ContributionGraph3D({ contributions, width = 1000, height = 520 }: ContributionGraph3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appearance = useGraphAppearanceStore((s) => s.appearance);
  const { resolvedTheme } = useTheme();

  const weeks = useMemo(() => {
    if (contributions.length === 0) return [] as ContributionDay[][];
    const list = [...contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const weeksAcc: ContributionDay[][] = [];
    let current: ContributionDay[] = [];
    list.forEach((day, index) => {
      const date = new Date(day.date);
      const dow = date.getDay();
      if (index === 0) {
        for (let i = 0; i < dow; i++) current.push({ date: '', count: 0, color: '#ebedf0', intensity: 0 });
      }
      current.push(day);
      if (current.length === 7) {
        weeksAcc.push(current);
        current = [];
      }
    });
    if (current.length > 0) {
      while (current.length < 7) current.push({ date: '', count: 0, color: '#ebedf0', intensity: 0 });
      weeksAcc.push(current);
    }
    return weeksAcc;
  }, [contributions]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const d of contributions) {
      if (d.count > max) max = d.count;
    }
    return max || 1;
  }, [contributions]);

  useEffect(() => {
    let canceled = false;
    async function ensureObelisk() {
      if (typeof window === 'undefined') return null;
      if (window.obelisk) return window.obelisk;
      await import('obelisk.js');
      return window.obelisk;
    }

    ensureObelisk().then((obelisk) => {
      if (canceled || !obelisk) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const c = canvas as HTMLCanvasElement;
      const context = ctx as CanvasRenderingContext2D;

      const point = new obelisk.Point(120, 30);
      const pixelView = new obelisk.PixelView(c, point);

      const baseHex = appearance.baseColor;
      const r = parseInt(baseHex.slice(1, 3), 16);
      const g = parseInt(baseHex.slice(3, 5), 16);
      const b = parseInt(baseHex.slice(5, 7), 16);
      const baseColorInt = (r << 16) + (g << 8) + b;

      const size = Math.max(6, Math.min(20, Math.round(appearance.size)));
      const heightUnit = Math.max(4, Math.min(64, Math.round(appearance.size * 1.6)));

      // Choose base floor color based on theme (ignore user-set base3DColor)
      const isDark = resolvedTheme === 'dark';
      const base3D = isDark ? '#2b2f36' : '#d9d9d9';
      const base3DHex = base3D.replace('#', '');
      const br = parseInt(base3DHex.slice(0, 2), 16);
      const bg = parseInt(base3DHex.slice(2, 4), 16);
      const bb = parseInt(base3DHex.slice(4, 6), 16);
      const baseLight = (Math.min(255, Math.round(br * 1.1)) << 16) + (Math.min(255, Math.round(bg * 1.1)) << 8) + Math.min(255, Math.round(bb * 1.1));
      const baseDark = (Math.max(0, Math.round(br * 0.7)) << 16) + (Math.max(0, Math.round(bg * 0.7)) << 8) + Math.max(0, Math.round(bb * 0.7));
      const colorBrick = new obelisk.SideColor(baseDark, baseLight);
      const dimensionBrick = new obelisk.BrickDimension(size, size);
      const brick = new obelisk.Brick(dimensionBrick, colorBrick);

      function blendWithWhiteComponent(c: number, alpha: number) {
        return Math.max(0, Math.min(255, Math.round(c * alpha + 255 * (1 - alpha))));
      }
      function colorForLevel(level: number) {
        const minO = appearance.minOpacity;
        const maxO = appearance.maxOpacity;
        const stops = [0, 1, 2, 3, 4].map((i) => minO + (i * (maxO - minO)) / 4);
        const a = stops[Math.max(0, Math.min(4, level))];
        const rr = blendWithWhiteComponent(r, a);
        const gg = blendWithWhiteComponent(g, a);
        const bb2 = blendWithWhiteComponent(b, a);
        return (rr << 16) + (gg << 8) + bb2;
      }

      function clear() {
        context.clearRect(0, 0, c.width, c.height);
        pixelView.clear();
      }

      clear();

      const gap = Math.max(0, Math.min(6, Math.round(appearance.gap)));
      const step = size - Math.min(2, Math.floor(size / 4)) + gap;

      for (let wx = 0; wx < weeks.length; wx++) {
        const week = weeks[wx];
        for (let wy = 0; wy < week.length; wy++) {
          const p3d = new obelisk.Point3D(wx * step, wy * step, 0);
          pixelView.renderObject(brick, p3d);
        }
      }

      for (let wx = 0; wx < weeks.length; wx++) {
        const week = weeks[wx];
        for (let wy = 0; wy < week.length; wy++) {
          const day = week[wy];
          if (!day.date) continue;
          const intensity = Math.max(0, Math.min(4, day.intensity));
          const hRaw = Math.round((day.count / maxCount) * heightUnit);
          const h = day.count > 0 ? Math.max(4, hRaw) : 0;
          if (h <= 0) continue;
          const dimensionCube = new obelisk.CubeDimension(size, size, h);
          const cubeBase = colorForLevel(intensity);
          const colorCube = new obelisk.CubeColor().getByHorizontalColor(cubeBase);
          const cube = new obelisk.Cube(dimensionCube, colorCube, false);
          const p3d = new obelisk.Point3D(wx * step, wy * step, 0);
          pixelView.renderObject(cube, p3d);
        }
      }
    });

    return () => {
      canceled = true;
    };
  }, [weeks, maxCount, appearance.baseColor, appearance.size, appearance.gap, appearance.minOpacity, appearance.maxOpacity, resolvedTheme]);

  return (
    <div className="w-full overflow-x-auto">
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
}



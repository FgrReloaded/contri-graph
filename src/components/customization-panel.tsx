"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "./ui/label"
import { useGraphAppearanceStore } from "@/store/graph-appearance"
import { useGraphViewStore } from "@/store/graph-view"
import { useStatsVisibilityStore } from "@/store/stats-visibility"
import { Switch } from "@/components/animate-ui/components/headless/switch"

export default function CustomizationPanel() {
    const value = useGraphAppearanceStore((s) => s.appearance)
    const setBaseColor = useGraphAppearanceStore((s) => s.setBaseColor)
    const setMinOpacity = useGraphAppearanceStore((s) => s.setMinOpacity)
    const setMaxOpacity = useGraphAppearanceStore((s) => s.setMaxOpacity)
    const setSize = useGraphAppearanceStore((s) => s.setSize)
    const setGap = useGraphAppearanceStore((s) => s.setGap)
    const setShape = useGraphAppearanceStore((s) => s.setShape)
    const setCameraAngleX = useGraphAppearanceStore((s) => s.setCameraAngleX)
    const setCameraAngleY = useGraphAppearanceStore((s) => s.setCameraAngleY)
    const setCameraAngleZ = useGraphAppearanceStore((s) => s.setCameraAngleZ)
    const setCameraAngles = useGraphAppearanceStore((s) => s.setCameraAngles)
    const mode = useGraphViewStore((s) => s.mode)
    const chartType = useGraphViewStore((s) => s.chartType)
    const chartVariant = useGraphViewStore((s) => s.chartVariant)
    const setChartVariant = useGraphViewStore((s) => s.setChartVariant)
    return (
        <div className="h-full lg:h-screen flex flex-col">
            <div className="w-full flex justify-center items-center text-center border-b p-4">
                <h5 className="text-left">Customize your graph</h5>
            </div>
            <div className="p-3 space-y-4">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Base color</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="color"
                            className="h-8 w-8 rounded border bg-transparent p-0"
                            value={value.baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            aria-label="Pick base color"
                        />
                        <Input
                            type="text"
                            value={value.baseColor}
                            onChange={(e) => setBaseColor(e.target.value)}
                            className="h-8"
                        />
                    </div>
                </div>
                {mode === "chart" && chartType !== "line" && chartType !== "area" && (
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Chart Variant</Label>
                        <Select
                            value={chartVariant.type === chartType ? chartVariant.variant : "default"}
                            onValueChange={(variant) => {
                                setChartVariant({ type: chartType, variant: variant as unknown as never })
                            }}
                        >
                            <SelectTrigger size="sm" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {getChartVariants(chartType).map((variant) => (
                                    <SelectItem key={variant.value} value={variant.value}>
                                        {variant.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {mode === "grid" && (
                    <>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Opacity range</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground">Min</span>
                                    <Input
                                        type="number"
                                        step={0.05}
                                        min={0}
                                        max={1}
                                        value={value.minOpacity}
                                        onChange={(e) => setMinOpacity(clamp(parseFloat(e.target.value), 0, 1))}
                                        className="h-8"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground">Max</span>
                                    <Input
                                        type="number"
                                        step={0.05}
                                        min={0}
                                        max={1}
                                        value={value.maxOpacity}
                                        onChange={(e) => setMaxOpacity(clamp(parseFloat(e.target.value), 0, 1))}
                                        className="h-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Dot size</Label>
                            <Input
                                type="number"
                                min={4}
                                max={28}
                                value={value.size}
                                onChange={(e) => setSize(clamp(parseInt(e.target.value || '0'), 4, 28))}
                                className="h-8"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Gap</Label>
                            <Input
                                type="number"
                                min={0}
                                max={12}
                                value={value.gap}
                                onChange={(e) => setGap(clamp(parseInt(e.target.value || '0'), 0, 12))}
                                className="h-8"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Shape</Label>
                            <Select value={value.shape} onValueChange={(v) => setShape(v as unknown as never)}>
                                <SelectTrigger size="sm" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rounded">Rounded</SelectItem>
                                    <SelectItem value="square">Square</SelectItem>
                                    <SelectItem value="circle">Circle</SelectItem>
                                    <SelectItem value="diamond">Diamond</SelectItem>
                                    <SelectItem value="triangle">Triangle</SelectItem>
                                    <SelectItem value="hexagon">Hexagon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}

                {mode === "grid-3d" && (
                    <>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Opacity range</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground">Min</span>
                                    <Input
                                        type="number"
                                        step={0.05}
                                        min={0}
                                        max={1}
                                        value={value.minOpacity}
                                        onChange={(e) => setMinOpacity(clamp(parseFloat(e.target.value), 0, 1))}
                                        className="h-8"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground">Max</span>
                                    <Input
                                        type="number"
                                        step={0.05}
                                        min={0}
                                        max={1}
                                        value={value.maxOpacity}
                                        onChange={(e) => setMaxOpacity(clamp(parseFloat(e.target.value), 0, 1))}
                                        className="h-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Size</Label>
                            <Input
                                type="number"
                                min={4}
                                max={28}
                                value={value.size}
                                onChange={(e) => setSize(clamp(parseInt(e.target.value || '0'), 4, 28))}
                                className="h-8"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Gap</Label>
                            <Input
                                type="number"
                                min={0}
                                max={12}
                                value={value.gap}
                                onChange={(e) => setGap(clamp(parseInt(e.target.value || '0'), 0, 12))}
                                className="h-8"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Camera Angles</Label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground w-8">X:</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={360}
                                        value={value.cameraAngleX}
                                        onChange={(e) => setCameraAngleX(clamp(parseInt(e.target.value || '0'), 0, 360))}
                                        className="h-8"
                                    />
                                    <span className="text-[11px] text-muted-foreground">°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground w-8">Y:</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={360}
                                        value={value.cameraAngleY}
                                        onChange={(e) => setCameraAngleY(clamp(parseInt(e.target.value || '0'), 0, 360))}
                                        className="h-8"
                                    />
                                    <span className="text-[11px] text-muted-foreground">°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-muted-foreground w-8">Z:</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={360}
                                        value={value.cameraAngleZ}
                                        onChange={(e) => setCameraAngleZ(clamp(parseInt(e.target.value || '0'), 0, 360))}
                                        className="h-8"
                                    />
                                    <span className="text-[11px] text-muted-foreground">°</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Angle Presets</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCameraAngles(45, 45, 45)}
                                    className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
                                >
                                    Default (45°)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCameraAngles(30, 60, 30)}
                                    className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
                                >
                                    Perspective
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCameraAngles(90, 0, 0)}
                                    className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
                                >
                                    Top View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCameraAngles(0, 90, 0)}
                                    className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
                                >
                                    Side View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCameraAngles(0, 45, 90)}
                                    className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
                                >
                                    Isometric
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCameraAngles(60, 30, 60)}
                                    className="px-3 py-1 text-xs border rounded hover:bg-accent transition-colors"
                                >
                                    Tilted
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs text-muted-foreground">Stats visibility</Label>
                    <StatsToggles />
                </div>
            </div>
        </div>
    )
}

function StatsToggles() {
    const showStreaks = useStatsVisibilityStore((s) => s.showStreaks)
    const showFirstMost = useStatsVisibilityStore((s) => s.showFirstMost)
    const showTotal = useStatsVisibilityStore((s) => s.showTotal)

    const setShowStreaks = useStatsVisibilityStore((s) => s.setShowStreaks)
    const setShowFirstMost = useStatsVisibilityStore((s) => s.setShowFirstMost)
    const setShowTotal = useStatsVisibilityStore((s) => s.setShowTotal)

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs">Show longest streak</span>
                <Switch checked={showStreaks} onChange={setShowStreaks} aria-label="Toggle longest streak" />
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs">Show most active day</span>
                <Switch checked={showFirstMost} onChange={setShowFirstMost} aria-label="Toggle most active day" />
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs">Show total contributions</span>
                <Switch checked={showTotal} onChange={setShowTotal} aria-label="Toggle total contributions" />
            </div>
        </div>
    )
}

function clamp(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min
    return Math.max(min, Math.min(max, n))
}

function getChartVariants(chartType: string) {
    switch (chartType) {
        case "pie":
            return [
                { value: "default", label: "Default" },
                { value: "stacked", label: "Stacked" },
                { value: "interactive", label: "Interactive" },
                { value: "donut", label: "Donut with Text" }
            ]
        case "bar":
            return [
                { value: "default", label: "Default" },
                { value: "horizontal", label: "Horizontal" },
                { value: "label", label: "Label" },
                { value: "month-labelled", label: "Month Labelled" }
            ]
        case "area":
            return [
                { value: "default", label: "Default" }
            ]
        case "line":
            return [
                { value: "default", label: "Default" }
            ]
        case "radar":
            return [
                { value: "default", label: "Default" },
                { value: "lines-only", label: "Lines Only" },
                { value: "grid-filled", label: "Grid Filled" },
                { value: "grid-circle-filled", label: "Grid Circle Filled" },
                { value: "grid-none", label: "Grid None" }
            ]
        case "radial":
            return [
                { value: "default", label: "Default" },
                { value: "progress", label: "Progress" },
                { value: "multi", label: "Multi" },
                { value: "gauge", label: "Gauge" }
            ]
        default:
            return [{ value: "default", label: "Default" }]
    }
}
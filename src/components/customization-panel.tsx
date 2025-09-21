"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "./ui/label"
import { useGraphAppearanceStore } from "@/store/graph-appearance"
import { useGraphViewStore } from "@/store/graph-view"

export default function CustomizationPanel() {
    const value = useGraphAppearanceStore((s) => s.appearance)
    const setBaseColor = useGraphAppearanceStore((s) => s.setBaseColor)
    const setMinOpacity = useGraphAppearanceStore((s) => s.setMinOpacity)
    const setMaxOpacity = useGraphAppearanceStore((s) => s.setMaxOpacity)
    const setSize = useGraphAppearanceStore((s) => s.setSize)
    const setGap = useGraphAppearanceStore((s) => s.setGap)
    const setShape = useGraphAppearanceStore((s) => s.setShape)
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
                                setChartVariant({ type: chartType, variant: variant as any })
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
                            <Select value={value.shape} onValueChange={(v) => setShape(v as any)}>
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
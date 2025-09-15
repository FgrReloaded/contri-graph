"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GraphAppearance } from "@/types/graph-appearance"
import { Label } from "./ui/label"

interface CustomizationPanelProps {
    value: GraphAppearance
    onChange: (next: GraphAppearance) => void
}

export default function CustomizationPanel({ value, onChange }: CustomizationPanelProps) {
    return (
        <div className="h-screen flex flex-col">
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
                            onChange={(e) => onChange({ ...value, baseColor: e.target.value })}
                            aria-label="Pick base color"
                        />
                        <Input
                            type="text"
                            value={value.baseColor}
                            onChange={(e) => onChange({ ...value, baseColor: e.target.value })}
                            className="h-8"
                        />
                    </div>
                </div>

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
                                onChange={(e) => onChange({ ...value, minOpacity: clamp(parseFloat(e.target.value), 0, 1) })}
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
                                onChange={(e) => onChange({ ...value, maxOpacity: clamp(parseFloat(e.target.value), 0, 1) })}
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
                        onChange={(e) => onChange({ ...value, size: clamp(parseInt(e.target.value || '0'), 4, 28) })}
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
                        onChange={(e) => onChange({ ...value, gap: clamp(parseInt(e.target.value || '0'), 0, 12) })}
                        className="h-8"
                    />
                </div>

                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Shape</Label>
                    <Select value={value.shape} onValueChange={(v) => onChange({ ...value, shape: v as any })}>
                        <SelectTrigger size="sm" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="circle">Circle</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}

function clamp(n: number, min: number, max: number) {
    if (Number.isNaN(n)) return min
    return Math.max(min, Math.min(max, n))
}
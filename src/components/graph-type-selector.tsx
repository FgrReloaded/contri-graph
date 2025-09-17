"use client"

import { useGraphViewStore } from "@/store/graph-view"
import { cn } from "@/lib/utils"

const charts: { key: ReturnType<typeof useGraphViewStore.getState>["chartType"]; label: string }[] = [
    { key: "area", label: "Area Charts" },
    { key: "bar", label: "Bar Charts" },
    { key: "line", label: "Line Charts" },
    { key: "pie", label: "Pie Charts" },
    { key: "radar", label: "Radar Charts" },
    { key: "radial", label: "Radial Charts" },
]

export default function GraphTypeSelector() {
    const mode = useGraphViewStore((s) => s.mode)
    const chartType = useGraphViewStore((s) => s.chartType)
    const setChartType = useGraphViewStore((s) => s.setChartType)

    if (mode === 'chart') {
        return (
            <div className="border-b flex flex-wrap justify-center items-center gap-2 p-2">
                {charts.map((c) => (
                    <button
                        key={c.key}
                        type="button"
                        onClick={() => setChartType(c.key)}
                        className={cn(
                            "px-3 py-1.5 rounded text-sm border",
                            chartType === c.key ? "bg-primary text-white border-primary" : "hover:bg-accent"
                        )}
                    >
                        {c.label}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="border-b flex justify-center items-center text-center">
            <div className="p-4 w-1/2 bg-primary border-r cursor-default text-white">
                <h1>2D Grid</h1>
            </div>
            <div className="p-4 w-1/2 text-gray-600">
                <h1>3D (Coming Soon)</h1>
            </div>
        </div>
    )
}
"use client"

import { useState } from "react"
import { useGraphViewStore } from "@/store/graph-view"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    const [open, setOpen] = useState(false)

    if (mode === 'chart') {
        return (
            <div className="border-b flex justify-between items-center">
                <div className="hidden lg:flex justify-center items-center w-full">
                    {charts.map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            onClick={() => setChartType(c.key)}
                            className={cn(
                                "p-4 border-0 rounded-none bg-transparent w-1/6 cursor-pointer", chartType === c.key ? "bg-primary text-white" : ""
                            )}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
                <div className="flex lg:hidden w-full justify-center">
                    <Button
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent transition cursor-pointer"
                        variant={"ghost"}
                        size={"sm"}
                        onClick={() => setOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h8" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-400">Graph types</span>
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="min-w-[95vw] sm:w-[80vw] max-h-[85vh] overflow-auto p-0">
                            <DialogHeader className="px-4 pt-4">
                                <DialogTitle>Graph types</DialogTitle>
                            </DialogHeader>
                            <div className="px-2 pb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {charts.map((c) => (
                                        <button
                                            key={c.key}
                                            type="button"
                                            onClick={() => { setChartType(c.key); setOpen(false); }}
                                            className={cn(
                                                "px-3 py-2 rounded border text-left",
                                                chartType === c.key ? "bg-primary text-white border-primary" : "hover:bg-accent"
                                            )}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
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
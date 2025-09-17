"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils";
import { PALETTES } from "@/lib/constant";
import { useGraphAppearanceStore } from "@/store/graph-appearance";

interface GraphSelectorProps {
    value?: string
    onSelect?: (hexColor: string) => void
}

export default function GraphSelector({ value, onSelect }: GraphSelectorProps) {
    const [selected, setSelected] = useState<string>(value || 'teal-mint')
    const setBaseColor = useGraphAppearanceStore((s) => s.setBaseColor)

    useEffect(() => {
        if (value && value !== selected) setSelected(value)
    }, [value])

    const handleSelect = (key: string) => {
        setSelected(key)
        const palette = PALETTES.find(p => p.key === key)
        if (palette) {
            const darkest = palette.colors[palette.colors.length - 1]
            if (onSelect) onSelect(darkest)
            setBaseColor(darkest)
        }
    }

    return (
        <div className="h-full lg:h-screen flex flex-col">
            <div className="w-full flex justify-center items-center text-center border-b">
                <div className="w-1/2 h-full bg-primary p-4 text-white">
                    <h1>Graphs</h1>
                </div>
                <div className="w-1/2 h-full p-4 cursor-default">
                    <h1>Charts</h1>
                </div>
            </div>
            <div className="w-full flex-1 min-h-0">
                <ScrollArea className="h-full w-full pr-2">
                    <div className="p-3 flex flex-wrap justify-center items-center gap-3 pb-36">
                        {PALETTES.map((p) => (
                            <div
                                key={p.key}
                                onClick={() => handleSelect(p.key)}
                                className={cn("w-full flex gap-3 p-3 text-left dark:text-white text-black rounded-sm hover:bg-accent cursor-pointer transition border", selected === p.key && "bg-primary hover:bg-primary/90 text-white")}
                            >
                                <div className=" flex items-center gap-1">
                                    {p.colors.slice(0, 5).map((c) => (
                                        <span key={c} className="h-4 w-4 flex-1 rounded" style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                                <div>
                                    <h1 className="text-sm text-center font-semibold">{p.name}</h1>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
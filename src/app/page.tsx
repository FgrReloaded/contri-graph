"use client"

import SearchBox from "@/components/search-box";
import EmptyArea from "@/components/empty-area";
import { useRef, useState } from "react";
import GraphSelector from "@/components/graph-selector";
import { ContributionGraph } from "@/components/contribution-graph";
import type { AllYearsData } from "@/types/contributions";
import Conditional from "@/components/conditional";
import GraphTypeSelector from "@/components/graph-type-selector";
import { Button } from "@/components/ui/button";
import CustomizationPanel from "@/components/customization-panel";
import { useGraphAppearanceStore } from "@/store/graph-appearance";
import GraphDialog from "@/components/graph-dialog";
import DownloadDialog from "@/components/download-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toPng } from "html-to-image";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GithubUser {
    id: string;
    avatar_url: string;
    name: string | null;
}

export default function Main() {
    const { resolvedTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<AllYearsData | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [error, setError] = useState<string>("");
    const setBaseColor = useGraphAppearanceStore((s) => s.setBaseColor);
    const [user, setUser] = useState<GithubUser | null>(null);
    const exportRef = useRef<HTMLDivElement | null>(null);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const [showPalettes, setShowPalettes] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [showTotal, setShowTotal] = useState(true);


    async function fetchData(target: string) {
        if (!target) return;
        setIsLoading(true);
        setError("");
        setData(null);
        setUser(null);
        try {
            const contributionPromise = (async () => {
                const res = await fetch(`/api/github/${encodeURIComponent(target)}?format=flat`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to fetch contributions");
                }
                const json: AllYearsData = await res.json();
                return json;
            })();

            const userPromise = (async () => {
                try {
                    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(target)}`);
                    if (!userRes.ok) return null;
                    const u: GithubUser = await userRes.json();
                    return { id: target, avatar_url: u.avatar_url, name: u.name } as GithubUser;
                } catch {
                    return null;
                }
            })();

            const [json, u] = await Promise.all([contributionPromise, userPromise]);

            setData(json);
            const years = Array.isArray(json.years) ? json.years : Object.values(json.years);
            if (years.length > 0) setSelectedYear(years[0].year);
            setUser(u);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <SearchBox onUsernameChange={fetchData} />
            <Conditional condition={isLoading || !data || !!error}>
                <EmptyArea isLoading={isLoading} error={error || undefined} />
            </Conditional>
            <Conditional condition={!!data}>
                <div className="flex justify-center items-start w-full flex-1">
                    <div className="hidden lg:block lg:w-1/5">
                        <GraphSelector onSelect={(hex) => setBaseColor(hex)} />
                    </div>
                    <div className="w-full lg:w-3/5 h-full border-l border-r flex flex-col">
                        <GraphTypeSelector />
                        <div className="p-2 border-b flex justify-between items-center gap-2">
                            <div className="flex items-center gap-4 ml-auto max-sm:justify-between max-sm:w-full">
                                <Button
                                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition cursor-pointer"
                                    variant={"ghost"}
                                    size={"sm"}
                                    onClick={() => setShowTotal((s) => !s)}
                                >
                                    {showTotal ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                            <span className="text-sm text-gray-700 dark:text-gray-400">Hide total</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h8" />
                                            </svg>
                                            <span className="text-sm text-gray-700 dark:text-gray-400">Show total</span>
                                        </>
                                    )}
                                </Button>
                                <div className="flex gap-2">
                                    {data && (
                                        <GraphDialog
                                            triggerClassName="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition cursor-pointer"
                                            triggerContent={(
                                                <div className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-700 dark:text-gray-400 max-sm:hidden">Preview</span>
                                                </div>
                                            )}
                                            user={user}
                                            showTotal={showTotal}
                                            data={data}
                                            selectedYear={selectedYear}
                                            onYearChange={setSelectedYear}

                                        />
                                    )}
                                    <Button
                                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition cursor-pointer"
                                        variant={"ghost"}
                                        size={"sm"}
                                        onClick={() => setDownloadOpen(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                                        </svg>
                                        <span className="text-sm text-gray-700 dark:text-gray-400 max-sm:hidden">Download</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className=" border-b flex justify-between items-center gap-2 lg:hidden">
                            <div className="flex items-center gap-2 w-full justify-center">
                                <Button
                                    className="px-2 py-1 border-r rounded-none w-1/2"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPalettes(true)}
                                >
                                    Palettes
                                </Button>
                                <Button
                                    className="px-2 py-1 w-1/2"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCustomize(true)}
                                >
                                    Customize
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="p-6 pb-0 h-[60vh]">
                            <ContributionGraph
                                data={data!}
                                selectedYear={selectedYear}
                                onYearChange={setSelectedYear}
                                user={user}
                                exportRef={exportRef}
                                showTotal={showTotal}
                            />
                        </ScrollArea>
                    </div>
                    <div className="hidden lg:block lg:w-1/5">
                        <CustomizationPanel />
                    </div>
                </div>
            </Conditional>
            <DownloadDialog
                open={downloadOpen}
                onOpenChange={setDownloadOpen}
                initialColor={resolvedTheme === "dark" ? "#0b0b0f" : "#ffffff"}
                onConfirm={async (bg) => {
                    if (!exportRef.current) return;
                    try {
                        const scrollables = Array.from(exportRef.current.querySelectorAll<HTMLElement>(".overflow-x-auto"));
                        const previousOverflow: string[] = [];
                        scrollables.forEach((el) => {
                            previousOverflow.push(el.style.overflowX);
                            el.style.overflowX = "visible";
                        });
                        const dataUrl = await toPng(exportRef.current, {
                            cacheBust: true,
                            pixelRatio: 2,
                            backgroundColor: bg === "transparent" ? undefined : bg,
                        });
                        scrollables.forEach((el, idx) => {
                            el.style.overflowX = previousOverflow[idx] || "";
                        });
                        const link = document.createElement('a');
                        link.download = `${user?.id || 'graph'}-${selectedYear || 'year'}.png`;
                        link.href = dataUrl;
                        link.click();
                    } catch (err) {
                        console.error('Failed to export image', err);
                    }
                }}
            />

            <Dialog open={showPalettes} onOpenChange={setShowPalettes}>
                <DialogContent className="min-w-[95vw] sm:w-[80vw] max-h-[85vh] overflow-auto p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle>Palettes</DialogTitle>
                    </DialogHeader>
                    <div className="px-2 pb-4">
                        <GraphSelector onSelect={(hex) => { setBaseColor(hex); setShowPalettes(false); }} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
                <DialogContent className="min-w-[95vw] sm:w-[80vw] max-h-[85vh] overflow-auto p-0">
                    <DialogHeader className="px-4 pt-4">
                        <DialogTitle>Customize</DialogTitle>
                    </DialogHeader>
                    <div className="px-2 pb-4">
                        <CustomizationPanel />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
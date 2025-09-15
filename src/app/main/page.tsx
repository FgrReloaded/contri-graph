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
import type { GraphAppearance } from "@/types/graph-appearance";
import { defaultGraphAppearance } from "@/types/graph-appearance";
import GraphDialog from "@/components/graph-dialog";
import { toPng } from "html-to-image";

interface GithubUser {
    login: string;
    id: string;
    avatar_url: string;
    name: string | null;
}

export default function Main() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<AllYearsData | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [appearance, setAppearance] = useState<GraphAppearance>(defaultGraphAppearance);
    const [user, setUser] = useState<GithubUser | null>(null);
    const exportRef = useRef<HTMLDivElement | null>(null);
    

    async function fetchData(target: string) {
        if (!target) return;
        setIsLoading(true);
        setError("");
        setData(null);
        setUser(null);
        try {
            const res = await fetch(`/api/github/${encodeURIComponent(target)}?format=flat`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to fetch contributions");
            }
            const json: AllYearsData = await res.json();
            setData(json);
            const years = Array.isArray(json.years) ? json.years : Object.values(json.years);
            if (years.length > 0) setSelectedYear(years[0].year);

            const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(target)}`);
            if (userRes.ok) {
                const u: GithubUser = await userRes.json();
                setUser({ login: u.login, id: target, avatar_url: u.avatar_url, name: u.name });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <SearchBox onUsernameChange={fetchData} />
            <Conditional condition={!!error}>
                <div className="text-center text-red-600 py-2">{error}</div>
            </Conditional>
            <Conditional condition={isLoading || !data}>
                <EmptyArea isLoading={isLoading} />
            </Conditional>
            <Conditional condition={!!data && !!user}>
                <div className="flex justify-center items-start w-full h-full">
                    <div className="w-1/5">
                        <GraphSelector />
                    </div>
                    <div className="w-3/5 border-l border-r h-full flex flex-col">
                        <GraphTypeSelector />
                        <div className="p-2 border-b flex justify-end items-center">
                            <div className="flex items-center gap-4">
                                {data && (
                                    <GraphDialog
                                        triggerClassName="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition cursor-pointer"
                                        triggerContent={(
                                            <div className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span className="text-sm text-gray-400">Preview</span>
                                            </div>
                                        )}
                                        user={user}
                                        data={data}
                                        selectedYear={selectedYear}
                                        onYearChange={setSelectedYear}
                                        appearance={appearance}
                                    />
                                )}
                                <Button
                                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition cursor-pointer"
                                    variant={"ghost"}
                                    size={"sm"}
                                    onClick={async () => {
                                        if (!exportRef.current) return;
                                        try {
                                            const dataUrl = await toPng(exportRef.current, {
                                                cacheBust: true,
                                                pixelRatio: 2,
                                            });
                                            const link = document.createElement('a');
                                            link.download = `${user?.login || 'graph'}-${selectedYear || 'year'}.png`;
                                            link.href = dataUrl;
                                            link.click();
                                        } catch (err) {
                                            console.error('Failed to export image', err);
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                    <span className="text-sm text-gray-400">Download</span>
                                </Button>
                            </div>
                        </div>
                        <div className="p-6">
                            <ContributionGraph
                                data={data!}
                                selectedYear={selectedYear}
                                onYearChange={setSelectedYear}
                                appearance={appearance}
                                user={user}
                                exportRef={exportRef}
                            />
                        </div>
                    </div>
                    <div className="w-1/5">
                        <CustomizationPanel value={appearance} onChange={setAppearance} />
                    </div>
                </div>
            </Conditional>
        </div>
    )
}
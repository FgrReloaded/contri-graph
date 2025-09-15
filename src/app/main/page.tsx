"use client"

import SearchBox from "@/components/search-box";
import EmptyArea from "@/components/empty-area";
import { useState } from "react";
import GraphSelector from "@/components/graph-selector";
import { ContributionGraph } from "@/components/contribution-graph";
import type { AllYearsData } from "@/types/contributions";
import Conditional from "@/components/conditional";

export default function Main() {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<AllYearsData | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [error, setError] = useState<string>("");

    async function fetchData(target: string) {
        if (!target) return;
        setIsLoading(true);
        setError("");
        setData(null);
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
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col">
            <SearchBox onUsernameChange={fetchData} />
            <Conditional condition={!!error}>
                <div className="text-center text-red-600 py-2">{error}</div>
            </Conditional>
            <Conditional condition={isLoading || !data}>
                <EmptyArea isLoading={isLoading} />
            </Conditional>
            <Conditional condition={!!data}>
                <div className="flex justify-center items-start w-full h-full">
                    <div className="w-1/5">
                        <GraphSelector />
                    </div>
                    <div className="w-3/5 border-l border-r h-full p-6">
                        <ContributionGraph data={data!} selectedYear={selectedYear} onYearChange={setSelectedYear} />
                    </div>
                    <div className="w-1/5"></div>
                </div>
            </Conditional>
        </div>
    )
}
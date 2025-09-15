"use client"
import SearchBox from "@/components/search-box";
import EmptyArea from "@/components/empty-area";
import { useState } from "react";
import GraphSelector from "@/components/graph-selector";

export default function Main() {
    const [username, setUsername] = useState("fgrreloaded");
    const [isLoading, setIsLoading] = useState(false);

    const isEmpty = username.length === 0;
    return (
        <div className="flex flex-col">
            <SearchBox onUsernameChange={setUsername} />
            {isEmpty && <EmptyArea isLoading={isLoading} />}
            {
                username && (
                    <div className="flex justify-center items-center w-full h-full">
                        <div className="w-1/5">
                            <GraphSelector />
                        </div>
                        <div className="w-3/5 border-l border-r h-full"></div>
                        <div className="w-1/5"></div>
                    </div>
                )
            }
        </div>
    )
}
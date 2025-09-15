"use client"
import SearchBox from "@/components/search-box";
import EmptyArea from "@/components/empty-area";
import { useState } from "react";

export default function Main() {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const isEmpty = username.length === 0;
    return (
        <div className="flex flex-col">
            <SearchBox onUsernameChange={setUsername} />
            {isEmpty && <EmptyArea isLoading={isLoading} />}
        </div>
    )
}
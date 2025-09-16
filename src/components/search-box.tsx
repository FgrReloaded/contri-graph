import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type SearchBoxProps = {
    onUsernameChange?: (username: string) => void;
};

export default function SearchBox({ onUsernameChange }: SearchBoxProps) {
    const [username, setUsername] = useState("");

    return (
        <div className="border-b flex justify-center items-center">
            <div className="w-full md:w-4/5 lg:w-3/5 sm:border-l border-r flex justify-center items-center">
                <div className="flex items-center w-full px-3 md:px-4 py-3 gap-2">
                    <span className="hidden sm:block text-gray-500 select-none text-base md:text-lg">https://www.github.com/</span>
                    <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onUsernameChange?.(username.trim());
                            }
                        }}
                        type="text"
                        placeholder="username"
                        className="outline-none border-none ring-0 placeholder:text-base focus-visible:ring-0 shadow-none dark:bg-transparent w-full sm:w-fit"
                        style={{ minWidth: 0 }}
                    />
                </div>
                <div className="w-1/2 sm:w-2/5 border-l">
                    <Button className="w-full py-8 text-base sm:text-xl rounded-none cursor-pointer"
                        onClick={(e) => onUsernameChange?.(username.trim())}>
                        Generate
                    </Button>
                </div>
            </div>
        </div>
    )
}
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
            <div className="w-3/5 border-l border-r flex justify-center items-center">
                <div className="flex items-center w-full px-4">
                    <span className="text-gray-500 select-none text-lg">https://www.github.com/</span>
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
                        className="outline-none border-none ring-0 placeholder:text-base focus-visible:ring-0 shadow-none dark:bg-transparent w-fit"
                        style={{ minWidth: 0 }}
                    />
                </div>
                <div className="w-2/5 border-l">
                    <Button className="w-full py-6 text-xl rounded-none cursor-pointer"
                        onClick={(e) => onUsernameChange?.(username.trim())}>
                        Generate
                    </Button>
                </div>
            </div>
        </div>
    )
}
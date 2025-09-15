import { Input } from "./ui/input";

export default function SearchBox() {
    return (
        <div className="border-b flex justify-center items-center">
            <div className="w-3/5 border-l border-r flex justify-center items-center">
                <div className="flex items-center w-full px-4">
                    <span className="text-gray-500 select-none">https://www.github.com/</span>
                    <Input
                        type="text"
                        placeholder="username"
                        className="outline-none border-none ring-0 focus-visible:ring-0 shadow-none dark:bg-transparent"
                        style={{ minWidth: 0 }}
                    />
                </div>
                <div className="w-2/5 border-l py-4 text-center cursor-pointer">
                    Generate 
                </div>
            </div>
        </div>
    )
}
import { ScrollArea } from "@/components/ui/scroll-area"

export default function GraphSelector() {
    return (
        <div className="h-screen flex flex-col">
            <div className="w-full flex justify-center items-center text-center border-b">
                <div className="w-1/2 h-full bg-primary text-black p-4 cursor-pointer">
                    <h1>Graphs</h1>
                </div>
                <div className="w-1/2 h-full p-4 hover:bg-accent cursor-pointer">
                    <h1>Charts</h1>
                </div>
            </div>
            <div className="w-full flex-1 min-h-0">
                <ScrollArea className="h-full w-full pr-2">
                    <div className="p-3 flex flex-wrap justify-center gap-2 pb-36">
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                        <div className="w-full h-1/2 p-3 hover:bg-accent cursor-pointer flex justify-center items-center gap-2 border rounded-sm">
                            {/* <div>

                        </div> */}
                            <div>
                                <h1 className="text-sm text-center">Classic Green</h1>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
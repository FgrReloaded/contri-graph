export default function GraphTypeSelector() {
    return (
        <div className="border-b flex justify-center items-center text-center">
            <div className="p-4 w-1/2 bg-primary border-r cursor-pointer">
                <h1>2D Graph</h1>
            </div>
            <div className="p-4 w-1/2 cursor-pointer">
                <h1>3D Graph</h1>
            </div>
        </div>
    )
}
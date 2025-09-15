type EmptyAreaProps = { isLoading?: boolean };

export default function EmptyArea({ isLoading = false }: EmptyAreaProps) {
    const weeks = 52;
    const days = 7;

    function seededRandom(seed: number): number {
        let t = seed + 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    function between(seed: number, min: number, max: number): number {
        return min + seededRandom(seed) * (max - min);
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 select-none">
            {isLoading ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-7 h-7 text-gray-500 dark:text-gray-400 animate-spin mb-4"
                    aria-hidden
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12a8 8 0 01-8 8" opacity=".3" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7 text-gray-500 dark:text-gray-400 mb-4 rotate-180"
                    aria-hidden
                >
                    <path d="M12 3.75a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V4.5a.75.75 0 01.75-.75z" />
                </svg>
            )}

            {isLoading && (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm px-5 py-3 text-center max-w-xl mt-1">
                    <p className="text-gray-700 dark:text-gray-200 text-sm">
                        Generating… please wait a moment
                    </p>
                </div>
            )}

            <div className="mt-3">
                <div className="grid grid-rows-7 grid-flow-col gap-[3px]" aria-hidden>
                    {Array.from({ length: weeks }).map((_, weekIndex) => (
                        <div key={weekIndex} className="contents">
                            {Array.from({ length: days }).map((_, dayIndex) => (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className="relative w-3 h-3 rounded-[2px] overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-300/70 dark:border-white/10"
                                >
                                    <div
                                        className="absolute inset-0 bg-emerald-500 dark:bg-emerald-400"
                                        style={{
                                            opacity: 0.15,
                                            animation: `twinkle ${between(weekIndex * 100 + dayIndex + 1, 1800, 3600)}ms ease-in-out ${between(weekIndex * 100 + dayIndex + 999, 0, 2400)}ms infinite`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes twinkle {
                    0% { opacity: 0.12; }
                    50% { opacity: 0.95; }
                    100% { opacity: 0.12; }
                }
            `}</style>
        </div>
    );
}
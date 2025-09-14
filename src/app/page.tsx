'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ContributionGraph } from '@/components/contribution-graph';
import { LoadingSpinner, ContributionGraphSkeleton } from '@/components/loading';
import type { AllYearsData } from '@/types/contributions';

type Palette = { key: string; name: string; colors: string[] };

declare module 'react' { interface CSSProperties { [key: `--${string}`]: string | number } }

const PALETTES: Palette[] = [
  { key: 'teal-mint', name: 'Teal Mint', colors: ['#EAF8F5', '#CFF3EA', '#9FE8D9', '#51CDBA', '#15A394'] },
  { key: 'sunset', name: 'Sunset', colors: ['#FFF0EB', '#FFD6C7', '#FFB196', '#FF8C6A', '#E45A42'] },
  { key: 'aurora', name: 'Aurora', colors: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA'] },
  { key: 'ocean', name: 'Ocean', colors: ['#EDF7FF', '#CCE7FF', '#99D0FF', '#62B5F5', '#2C89D9'] },
  { key: 'lavender', name: 'Lavender', colors: ['#F6F1FF', '#E9DCFF', '#D3BFFF', '#B697FF', '#9067F7'] },
  { key: 'mango', name: 'Mango', colors: ['#FFF7E8', '#FFE8B8', '#FFD482', '#FFB84D', '#F28C00'] },
  { key: 'blush', name: 'Blush', colors: ['#FFF1F2', '#FFE0E4', '#FFC2CB', '#FF9AA8', '#F77084'] },
  { key: 'leaf', name: 'Leaf', colors: ['#F1FAF4', '#DBF4E4', '#BFEAD0', '#83D2A6', '#49B47D'] },
  { key: 'plum', name: 'Plum', colors: ['#FBF5FF', '#F2E6FF', '#E0C7FF', '#C89EFF', '#A26BF4'] },
  { key: 'coral', name: 'Coral', colors: ['#FFF5F1', '#FFE2D8', '#FFC4B2', '#FF9A84', '#F16C57'] },
];

const SHAPES = [
  { key: 'rounded', label: 'Rounded' },
  { key: 'circle', label: 'Circle' },
  { key: 'square', label: 'Square' },
  { key: 'diamond', label: 'Diamond' },
  { key: 'hex', label: 'Hex' },
] as const;

export default function Home() {
  const [username, setUsername] = useState('');
  const [contributionData, setContributionData] = useState<AllYearsData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [paletteKey, setPaletteKey] = useState<string>('teal-mint');
  const [shape, setShape] = useState<'square' | 'rounded' | 'circle' | 'diamond' | 'hex'>('rounded');
  const [size, setSize] = useState<number>(12);
  const [gap, setGap] = useState<number>(2);
  const [showMonths, setShowMonths] = useState<boolean>(true);
  const [showWeekdays, setShowWeekdays] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showYearSelector, setShowYearSelector] = useState<boolean>(true);
  const [showYearSummary, setShowYearSummary] = useState<boolean>(true);

  const colorScale = useMemo(() => {
    const p = PALETTES.find(x => x.key === paletteKey) ?? PALETTES[0];
    return p.colors.slice(0, 5);
  }, [paletteKey]);

  const fetchContributions = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setIsLoading(true);
    setError('');
    setContributionData(null);

    try {
      const response = await fetch(`/api/github/${encodeURIComponent(username.trim())}?format=flat`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contributions');
      }

      const data: AllYearsData = await response.json();
      setContributionData(data);

      const years = Array.isArray(data.years) ? data.years : Object.values(data.years);
      if (years.length > 0) {
        setSelectedYear(years[0].year);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContributions();
  };

  const resetData = () => {
    setContributionData(null);
    setSelectedYear('');
    setError('');
    setUsername('');
  };

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#F4FBFA] via-[#F4F6FF] to-[#FFF6F2]" />
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900/90 mb-3">ContriGraph</h1>
          <p className="text-base md:text-lg text-gray-700/80 max-w-2xl mx-auto">Visualize and customize your GitHub activity with a clean, playful panel. Pick colors, shapes, and layout that match your vibe.</p>
        </div>

        <Card className="p-4 md:p-6 mb-6 md:mb-8 border-0 shadow-sm bg-white/70 backdrop-blur rounded-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-1 w-full">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">GitHub Username</label>
              <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., octocat" className="w-full" disabled={isLoading} />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button type="submit" disabled={isLoading || !username.trim()} className="px-6 flex-1 lg:flex-none">{isLoading ? 'Loading…' : 'View'}</Button>
              {contributionData && (<Button type="button" variant="outline" onClick={resetData} className="px-4">Clear</Button>)}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </Card>

        <Card className="p-4 md:p-6 mb-8 border-0 shadow-sm bg-white/70 backdrop-blur rounded-2xl">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900/90">Palette</h3>
                  <div className="text-xs text-gray-500">Intensity 0–4</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {PALETTES.map(p => (
                    <button key={p.key} type="button" onClick={() => setPaletteKey(p.key)} className={`group rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-teal-400/50 ${paletteKey === p.key ? 'border-teal-400 ring-1 ring-teal-400/40' : 'border-gray-200 hover:border-gray-300'}`} aria-pressed={paletteKey === p.key} aria-label={`Select ${p.name} palette`}>
                      <div className="p-3">
                        <div className="flex gap-1 mb-2">
                          {p.colors.slice(0, 5).map(c => (
                            <span key={c} className="h-4 flex-1 rounded" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="text-left text-sm text-gray-700">{p.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">Dot Shape</legend>
                  <div className="flex flex-wrap gap-2">
                    {SHAPES.map(s => (
                      <button key={s.key} type="button" onClick={() => setShape(s.key as typeof shape)} className={`px-3 py-1.5 rounded-md text-sm border transition ${shape === s.key ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-300 bg-white hover:bg-gray-50'}`} aria-pressed={shape === s.key}>{s.label}</button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dotsize" className="block text-sm font-medium text-gray-700 mb-2">Dot Size</label>
                    <input id="dotsize" type="range" min={8} max={18} step={1} value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full accent-teal-500" />
                    <div className="text-xs text-gray-500 mt-1">{size}px</div>
                  </div>
                  <div>
                    <label htmlFor="dotgap" className="block text-sm font-medium text-gray-700 mb-2">Gap</label>
                    <input id="dotgap" type="range" min={0} max={6} step={1} value={gap} onChange={(e) => setGap(parseInt(e.target.value))} className="w-full accent-teal-500" />
                    <div className="text-xs text-gray-500 mt-1">{gap}px</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-1">
              <h3 className="font-semibold text-gray-900/90 mb-3">Display</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={showMonths} onChange={(e) => setShowMonths(e.target.checked)} className="accent-teal-600" />
                  <span className="text-gray-700">Months</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={showWeekdays} onChange={(e) => setShowWeekdays(e.target.checked)} className="accent-teal-600" />
                  <span className="text-gray-700">Weekdays</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} className="accent-teal-600" />
                  <span className="text-gray-700">Legend</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={showYearSelector} onChange={(e) => setShowYearSelector(e.target.checked)} className="accent-teal-600" />
                  <span className="text-gray-700">Year selector</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={showYearSummary} onChange={(e) => setShowYearSummary(e.target.checked)} className="accent-teal-600" />
                  <span className="text-gray-700">Year summary cards</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {isLoading && (
          <Card className="p-8 border-0 shadow-sm bg-white/70 backdrop-blur rounded-2xl">
            <div className="text-center mb-4">
              <LoadingSpinner />
              <p className="text-gray-600 mt-2">Fetching contribution data…</p>
            </div>
            <ContributionGraphSkeleton />
          </Card>
        )}

        {contributionData && !isLoading && (
          <Card className="p-4 md:p-6 border-0 shadow-sm bg-white/70 backdrop-blur rounded-2xl">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">{username}'s Contribution History</h2>
              <div className="text-sm text-gray-600">Total contributions: {Array.isArray(contributionData.years) ? contributionData.years.reduce((sum, year) => sum + year.total, 0) : Object.values(contributionData.years).reduce((sum, year) => sum + year.total, 0)}</div>
            </div>

            <div className="mb-6">
              <ContributionGraph data={contributionData} selectedYear={selectedYear} onYearChange={setSelectedYear} colorScale={colorScale} shape={shape} size={size} gap={gap} showMonths={showMonths} showWeekdays={showWeekdays} showLegend={showLegend} showYearSelector={showYearSelector} />
            </div>

            {showYearSummary && (
              <div className="pt-6 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Array.isArray(contributionData.years) ? contributionData.years : Object.values(contributionData.years)).slice(0, 3).map((year) => (
                    <div key={year.year} className="text-center p-4 bg-white/60 rounded-xl border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900">{year.total}</div>
                      <div className="text-sm text-gray-600">contributions in {year.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {!contributionData && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20" role="img" aria-label="Contribution graph placeholder">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">Enter a GitHub username above to visualize contribution history</p>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ContributionGraph } from '@/components/contribution-graph';
import { LoadingSpinner, ContributionGraphSkeleton } from '@/components/loading';
import type { AllYearsData } from '@/types/contributions';

export default function Home() {
  const [username, setUsername] = useState('');
  const [contributionData, setContributionData] = useState<AllYearsData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GitHub Contribution Graph
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visualize your GitHub contribution history with beautiful, interactive graphs.
            Enter any GitHub username to see their contribution patterns.
          </p>
        </div>

        <Card className="p-4 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username (e.g., octocat)"
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="submit"
                disabled={isLoading || !username.trim()}
                className="px-6 flex-1 sm:flex-none"
              >
                {isLoading ? 'Loading...' : 'View Contributions'}
              </Button>
              {contributionData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetData}
                  className="px-4"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </Card>

        {isLoading && (
          <Card className="p-8">
            <div className="text-center mb-4">
              <LoadingSpinner />
              <p className="text-gray-600 mt-2">Fetching contribution data...</p>
            </div>
            <ContributionGraphSkeleton />
          </Card>
        )}

        {contributionData && !isLoading && (
          <Card className="p-4 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                {username}'s Contribution History
              </h2>
              <div className="text-sm text-gray-600">
                Total contributions: {
                  Array.isArray(contributionData.years)
                    ? contributionData.years.reduce((sum, year) => sum + year.total, 0)
                    : Object.values(contributionData.years).reduce((sum, year) => sum + year.total, 0)
                }
              </div>
            </div>

            <div className="mb-6">
              <ContributionGraph
                data={contributionData}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
              />
            </div>

            <div className="pt-6 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(contributionData.years) ? contributionData.years : Object.values(contributionData.years))
                  .slice(0, 3)
                  .map((year) => (
                    <div key={year.year} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{year.total}</div>
                      <div className="text-sm text-gray-600">contributions in {year.year}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </Card>
        )}

        {!contributionData && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
                role="img"
                aria-label="Contribution graph placeholder"
              >
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">
              Enter a GitHub username above to visualize contribution history
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

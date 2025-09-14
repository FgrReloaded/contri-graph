export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function ContributionGraphSkeleton() {
  const skeletonGrid = Array.from({ length: 371 }, (_, index) => index);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-53 gap-1">
        {skeletonGrid.map((index) => (
          <div
            key={`skeleton-${index}`}
            className="w-3 h-3 bg-gray-200 rounded-sm animate-pulse"
            style={{ animationDelay: `${index * 10}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

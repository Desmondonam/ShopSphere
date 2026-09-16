export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="aspect-square bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default function ProductGridSkeleton({ count = 6, className = 'grid-cols-2 lg:grid-cols-3' }: { count?: number; className?: string }) {
  return (
    <div className={`grid ${className} gap-x-6 gap-y-12`} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-100" />
          <div className="mt-4 h-2.5 w-2/3 bg-gray-100" />
          <div className="mt-2 h-2 w-1/3 bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

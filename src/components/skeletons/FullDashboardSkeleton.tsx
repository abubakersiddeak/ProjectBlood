import { Skeleton } from "@/components/ui/skeleton";

export function FullDashboardSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Sidebar Skeleton */}
      <div className="hidden w-64 border-r md:block p-4 space-y-4">
        <Skeleton className="h-10 w-3/4 mb-8" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      <div className="flex flex-1 flex-col">
        {/* Header Skeleton */}
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </header>

        {/* Content Area Skeleton */}
        <main className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    </div>
  );
}

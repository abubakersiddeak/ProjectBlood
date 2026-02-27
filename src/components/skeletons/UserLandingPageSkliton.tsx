import { Skeleton } from "../ui/skeleton";

export function UserLandingPageSkliton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Impact Summary Skeleton */}
        <div className="bg-white  p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-16 h-16 " />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Alert Skeleton */}
        <div className="bg-white  p-4 border border-gray-100">
          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-full mb-3" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white  p-5 border border-gray-100">
              <Skeleton className="w-10 h-10 rounded-xl mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Request Statistics Skeleton */}
        <div className="bg-white  p-5 border border-gray-100">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Skeleton */}
        <div>
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white  p-4 border border-gray-100 text-center"
              >
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Donor Level Skeleton */}
        <div className="bg-gray-800  p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-3 w-20 mb-2 bg-gray-700" />
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full bg-gray-700" />
          </div>
          <Skeleton className="h-2 w-full bg-gray-700 rounded-full mb-3" />
          <Skeleton className="h-3 w-40 bg-gray-700" />
        </div>

        {/* Notifications Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="bg-white  border border-gray-100 p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

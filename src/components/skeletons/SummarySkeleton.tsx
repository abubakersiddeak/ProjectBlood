import React from "react";

export default function SummarySkeleton() {
  const skeletonCards = Array.from({ length: 5 });
  return (
    <div className="px-1 lg:px-6">
      <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-5 gap-4">
        {skeletonCards.map((_, idx) => (
          <div
            key={idx}
            className="bg-white shadow p-4 flex items-center gap-3 animate-pulse"
          >
            {/* Icon placeholder */}
            <div className="w-10 h-10 bg-gray-200 rounded-full" />

            {/* Text placeholders */}
            <div className="flex flex-col flex-1 gap-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

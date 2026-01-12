"use client"; // Must be at the very top

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to your console or an error reporting service
    console.error("Project Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-6 italic">
        {error.message || "An unexpected error occurred"}
      </p>

      <button
        onClick={() => reset()}
        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

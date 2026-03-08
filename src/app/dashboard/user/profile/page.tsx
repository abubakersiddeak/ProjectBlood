"use client";

import { useSession } from "next-auth/react";
import { UserDetailsComponent } from "@/components/shared/UserDetails";
import { Loader2, UserX, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative mb-6">
              <Loader2 className="h-16 w-16 text-red-600 animate-spin" />
              <div className="absolute inset-0 bg-red-100 dark:bg-red-950 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Loading Profile
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while we fetch your information...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Unauthenticated State
  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            {/* Icon */}
            <div className="bg-red-100 dark:bg-red-950 p-4 rounded-full mb-6">
              <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              Authentication Required
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8 max-w-sm">
              You need to be signed in to view this page. Please log in to
              access your profile and continue.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/login")}
                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User ID Not Found State
  if (!session.user?.id) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            {/* Icon */}
            <div className="bg-red-100 dark:bg-red-950 p-4 rounded-full mb-6">
              <UserX className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              User Not Found
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8 max-w-sm">
              We couldn't find your user information. This might be due to a
              session error. Please try logging out and signing in again.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/api/auth/signout")}
                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Sign Out
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State - Render User Details
  return (
    <div>
      {/* Main Content */}
      <div className="container mx-auto ">
        <UserDetailsComponent userId={session.user.id} />
      </div>
    </div>
  );
}

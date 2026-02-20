"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import NotificationBody from "@/components/shared/NotificationBody";
import {
  IconDroplet,
  IconHeart,
  IconCalendar,
  IconAward,
  IconMapPin,
  IconPhone,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className=" mx-auto px-4 py-8 lg:px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-8">
          <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <IconDroplet className="w-6 h-6 text-red-600" />
              </div>
              <IconTrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              Total Donations
            </p>
            <p className="text-3xl font-bold text-gray-900">12 Times</p>
            <p className="text-xs text-green-600 mt-2">+2 this month</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <IconCalendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              Next Donation
            </p>
            <p className="text-xl font-bold text-gray-900">In 45 days</p>
            <p className="text-xs text-gray-500 mt-2">Jan 15, 2025</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <IconAward className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">
              Donor Level
            </p>
            <p className="text-xl font-bold text-gray-900">Gold Donor</p>
            <p className="text-xs text-gray-500 mt-2">3 more to Platinum</p>
          </div>
          {/* Notifications */}
          <div className="bg-white border rounded-lg col-span-2">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-gray-900">Notifications</h3>
            </div>
            <NotificationBody />
          </div>
        </div>

        {/* Alert Banner */}
        {/* <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">
                Urgent Blood Needed!
              </h3>
              <p className="text-sm text-red-800">
                A+ blood type needed at City Hospital.{" "}
                <Link href="/requests" className="underline font-semibold">
                  View Details →
                </Link>
              </p>
            </div>
          </div>
        </div> */}

        {/* Quick Actions */}
        {/* <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/requests"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all group"
            >
              <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-600 transition-colors mb-3">
                <IconUsers className="w-6 h-6 text-red-600 group-hover:text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Blood Requests
              </span>
              <span className="text-xs text-gray-500 mt-1">12 active</span>
            </Link>

            <Link
              href="/search"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-600 transition-colors mb-3">
                <IconSearch className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Find Donors
              </span>
              <span className="text-xs text-gray-500 mt-1">Search now</span>
            </Link>

            <Link
              href="/history"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-green-600 hover:bg-green-50 transition-all group"
            >
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-600 transition-colors mb-3">
                <IconHistory className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                My History
              </span>
              <span className="text-xs text-gray-500 mt-1">View all</span>
            </Link>

            <Link
              href="/centers"
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all group"
            >
              <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-600 transition-colors mb-3">
                <IconMapPin className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Blood Centers
              </span>
              <span className="text-xs text-gray-500 mt-1">Find nearby</span>
            </Link>
          </div>
        </div> */}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Donations & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Donations */}
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Donations
                </h3>
                <Link
                  href="/schedule"
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  View All →
                </Link>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-red-50 border-l-4 border-red-600 hover:bg-red-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">
                        A+
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        Emergency Blood Needed
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Patient: John Doe • City Hospital
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="w-4 h-4" />
                          <span>Dec 25, 2024</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconMapPin className="w-4 h-4" />
                          <span>Dhaka</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconPhone className="w-4 h-4" />
                          <span>+880 1234567890</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        URGENT
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-blue-50 border-l-4 border-blue-600 hover:bg-blue-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                        A+
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        Regular Donation Schedule
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Red Crescent Blood Center
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <IconCalendar className="w-4 h-4" />
                          <span>Jan 15, 2025</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconMapPin className="w-4 h-4" />
                          <span>Dhaka</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                        SCHEDULED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Donation Completed
                      </p>
                      <p className="text-sm text-gray-600">
                        You donated blood at City Hospital
                      </p>
                      <span className="text-xs text-gray-400">2 days ago</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Request Accepted
                      </p>
                      <p className="text-sm text-gray-600">
                        You accepted a donation request
                      </p>
                      <span className="text-xs text-gray-400">5 days ago</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Achievement Unlocked
                      </p>
                      <p className="text-sm text-gray-600">
                        Gold Donor badge earned
                      </p>
                      <span className="text-xs text-gray-400">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Notifications & Impact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Your Impact */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <IconHeart className="w-6 h-6" />
                Your Impact
              </h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Lives Saved</p>
                  <p className="text-4xl font-black">36</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm opacity-90 mb-1">Donations This Year</p>
                  <p className="text-4xl font-black">4</p>
                </div>
                <div className="text-center pt-4 border-t border-white/20">
                  <p className="text-sm opacity-90">You're a lifesaver! 🎉</p>
                  <p className="text-xs opacity-75 mt-1">
                    Keep up the amazing work
                  </p>
                </div>
              </div>
            </div>

            {/* Donation Eligibility */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Donation Eligibility
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Age</span>
                  <span className="text-sm font-semibold text-green-600">
                    ✓ Eligible
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Weight</span>
                  <span className="text-sm font-semibold text-green-600">
                    ✓ Eligible
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Donation</span>
                  <span className="text-sm font-semibold text-green-600">
                    ✓ Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health Status</span>
                  <span className="text-sm font-semibold text-green-600">
                    ✓ Good
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-center text-green-600 font-semibold">
                  You can donate now!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

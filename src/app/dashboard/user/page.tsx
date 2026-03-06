"use client";
import { useSession } from "next-auth/react";
import NotificationBody from "@/components/shared/NotificationBody";
import {
  IconDroplet,
  IconHeart,
  IconCalendar,
  IconMapPin,
  IconChevronRight,
  IconAlertCircle,
  IconTarget,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserLandingPageSkliton } from "@/components/skeletons/UserLandingPageSkliton";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [sData, setSData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const res = await fetch("/api/summary");
        const data = await res.json();
        if (data.success) {
          setSData(data.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummaryData();
  }, []);

  if (loading) {
    return <UserLandingPageSkliton />;
  }

  // Extract data from API response
  const userData = sData?.user || {};
  const donations = sData?.donations || {};
  const requests = sData?.requests || {};
  const level = sData?.level || {};
  const rating = sData?.rating || {};
  const opportunities = sData?.opportunities || {};
  const badges = sData?.badges || [];
  const recentDonations = sData?.recentDonations || [];

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="mx-auto px-4 py-6 space-y-6 pb-24 ">
        {/* Impact Summary */}
        <div className="bg-white  p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Impact</p>
              <h2 className="text-4xl font-bold text-gray-900">
                {donations.livesSaved || 0}
              </h2>
              <p className="text-xs text-gray-500 mt-1">lives saved</p>
              {donations.thisYear > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <IconTrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-semibold text-green-600">
                    {donations.thisYear} donations this year
                  </span>
                </div>
              )}
            </div>
            <div className="w-16 h-16  flex items-center justify-center">
              <IconHeart className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {donations.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Total Donations</p>
              {donations.verified > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {donations.verified} verified
                </p>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {userData.bloodGroup || "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Blood Type</p>
              {userData.isAvailable && (
                <p className="text-xs text-green-600 mt-1">✓ Available</p>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {donations.canDonateNow ? (
                  <span className="text-green-600">Ready</span>
                ) : (
                  `${donations.daysUntilEligible}d`
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {donations.canDonateNow ? "Can Donate" : "Next Eligible"}
              </p>
              {!donations.canDonateNow && donations.nextEligibleDate && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(donations.nextEligibleDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          {rating.totalRatings > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <IconStar className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900">
                  {rating.average}
                </span>
                <span className="text-sm text-gray-500">
                  ({rating.totalRatings} ratings)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Opportunities Alert */}
        {opportunities.matchingBloodRequests > 0 && (
          <div className="bg-red-50  p-4 border border-red-100">
            <div className="flex gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-red-500  flex items-center justify-center">
                  <IconAlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-red-700">
                    {opportunities.matchingBloodRequests} MATCHING REQUESTS
                  </span>
                  {opportunities.nearbyRequests > 0 && (
                    <>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">
                        {opportunities.nearbyRequests} nearby
                      </span>
                    </>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {userData.bloodGroup} Blood Needed
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  People are looking for your blood type
                </p>
                <Link
                  href="/requests"
                  className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  View Requests
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/searchDonors"
            className="bg-white  p-5 border border-gray-100 hover:border-gray-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-50  flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <IconTarget className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Find Donors
            </h3>
            <p className="text-xs text-gray-500">Search nearby</p>
          </Link>

          <Link
            href="/allBloodRequest"
            className="bg-white  p-5 border border-gray-100 hover:border-gray-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-red-50  flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
              <IconDroplet className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Requests
            </h3>
            <p className="text-xs text-gray-500">
              {requests.active > 0 ? `${requests.active} active` : "View all"}
            </p>
          </Link>

          <Link
            href="#"
            className="bg-white  p-5 border border-gray-100 hover:border-gray-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-50  flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <IconCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              My History
            </h3>
            <p className="text-xs text-gray-500">
              {donations.total > 0
                ? `${donations.total} donations`
                : "View all"}
            </p>
          </Link>

          <Link
            href="/dashboard/user/myBloodRequest"
            className="bg-white  p-5 border border-gray-100 hover:border-gray-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-50  flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <IconMapPin className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              My Requests
            </h3>
            <p className="text-xs text-gray-500">
              {requests.totalCreated > 0
                ? `${requests.totalCreated} created`
                : "Create new"}
            </p>
          </Link>
        </div>

        {/* Recent Donations */}
        {recentDonations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Recent Donations
              </h2>
              <Link
                href="/history"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                See all
              </Link>
            </div>

            <div className="space-y-3">
              {recentDonations
                .slice(0, 3)
                .map((donation: any, index: number) => (
                  <div
                    key={donation._id || index}
                    className="bg-white  p-4 border border-gray-100"
                  >
                    <div className="flex gap-3">
                      <div className="shrink-0">
                        <div className="w-12 h-12 bg-green-50  flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">
                            {donation.bloodGroup}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">
                              {donation.hospitalName}
                            </h4>
                            {donation.requesterId?.fullName && (
                              <p className="text-xs text-gray-500">
                                For: {donation.requesterId.fullName}
                              </p>
                            )}
                          </div>
                          {donation.isVerified && (
                            <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 ">
                              ✓ Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <IconCalendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(
                                donation.donationDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {donation.rating && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <IconStar className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span>{donation.rating}/5</span>
                            </div>
                          )}
                        </div>

                        {donation.reviewMessage && (
                          <p className="text-xs text-gray-600 italic">
                            {donation.reviewMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Request Statistics */}
        {requests.totalCreated > 0 && (
          <div className="bg-white  p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Your Requests Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.totalCreated}
                </p>
                <p className="text-xs text-gray-500">Total Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.active}
                </p>
                <p className="text-xs text-gray-500">Active Now</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {requests.confirmed}
                </p>
                <p className="text-xs text-gray-500">Confirmed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {requests.responded}
                </p>
                <p className="text-xs text-gray-500">You Responded</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {badges.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Your Achievements
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-4 border border-gray-100 text-center"
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-xs font-semibold text-gray-900">
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donor Level Progress */}
        <div className="bg-linear-to-br from-green-700 to-green-700 p-6 text-white  shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-green-100 mb-1">Donor Level</p>
              <h3 className="text-xl font-bold">
                {level.current || "New Donor"}
              </h3>
            </div>
            <span className="text-4xl filter drop-shadow-md">
              {level.current === "Platinum"
                ? "💎"
                : level.current === "Gold"
                  ? "🏆"
                  : level.current === "Silver"
                    ? "🥈"
                    : level.current === "Bronze"
                      ? "🥉"
                      : "🌟"}
            </span>
          </div>

          {level.donationsForNextLevel > 0 && (
            <>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-100">
                    Progress to {level.next}
                  </span>
                  <span className="font-bold">{level.progressPercentage}%</span>
                </div>
                {/* Progress Bar Container */}
                <div className="h-2.5 bg-green-800/40 rounded-full overflow-hidden border border-green-500/30">
                  <div
                    className="h-full bg-linear-to-r from-emerald-300 to-teal-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${level.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {level.donationsForNextLevel} more{" "}
                {level.donationsForNextLevel === 1 ? "donation" : "donations"}{" "}
                to unlock {level.next}
              </p>
            </>
          )}
        </div>

        {/* Notifications */}
        {/* <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Notifications</h2>
            <Link
              href="/notifications"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              See all
            </Link>
          </div>

          <div className="bg-white  border border-gray-100 overflow-hidden">
            <NotificationBody />
          </div>
        </div> */}
      </div>
    </div>
  );
}

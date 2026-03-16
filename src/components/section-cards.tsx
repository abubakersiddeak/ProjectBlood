"use client";
import { useSession } from "next-auth/react";
import {
  IconUsers,
  IconShieldCheck,
  IconHeart,
  IconDroplet,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Gpu } from "lucide-react";
import { useEffect, useState } from "react";
import SummarySkeleton from "./skeletons/SummarySkeleton";

// ✅ Updated Interface to match new API structure
interface SummaryData {
  users?: {
    total: number;
    admins: number;
    volunteers: number;
    regularUsers: number;
  };
  requests?: {
    total: number;
    pending: number;
    inProgress: number;
    success: number;
    cancel: number;
  };
  donations?: {
    total: number;
    verified: number;
    unverified: number;
  };
  bloodGroups?: Array<{ _id: string; count: number }>;
  recentActivity?: {
    requests: number;
    donations: number;
  };
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
}

function StatCard({ title, value, icon, subtitle }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <p className="text-sm text-gray-600 font-medium mb-1 text-center">
        {title}
      </p>
      <div className="flex items-center justify-center gap-4">
        <div className="p-2">{icon}</div>
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function SectionCards() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const userRole = session?.user?.role || "user";

  useEffect(() => {
    const fetchSummary = async () => {
      // Wait for session to be loaded
      if (status === "loading") return;
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/summary");

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const json = await res.json();

        if (json.success) {
          setSummaryData(json.data);
        } else {
          setError(json.message || "Failed to load summary data");
        }
      } catch (error: any) {
        console.error("Dashboard fetch error:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [session, status]);

  // ✅ Loading state
  if (status === "loading" || loading) {
    return <SummarySkeleton />;
  }

  // ✅ Unauthenticated state
  if (!session?.user) {
    return null;
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="px-1 lg:px-6">
        <div className="bg-red-50 border border-red-200 p-6 text-center">
          <IconAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Summary
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ No data state
  if (!summaryData) {
    return (
      <div className="px-1 lg:px-6">
        <div className="bg-gray-50 border border-gray-200 p-6 text-center">
          <p className="text-gray-600">No summary data available</p>
        </div>
      </div>
    );
  }

  // ✅ Extract data with proper fallbacks
  const users = summaryData.users || {
    total: 0,
    admins: 0,
    volunteers: 0,
    regularUsers: 0,
  };
  const requests = summaryData.requests || {
    total: 0,
    pending: 0,
    inProgress: 0,
    success: 0,
    cancel: 0,
  };
  const donations = summaryData.donations || {
    total: 0,
    verified: 0,
    unverified: 0,
  };
  const recentActivity = summaryData.recentActivity || {
    requests: 0,
    donations: 0,
  };

  // ✅ Define cards based on role with new data structure
  const cards = [
    {
      title: "Total Users",
      value: users.total,
      icon: <IconUsers className="w-6 h-6 text-gray-700" />,
      subtitle: `${users.regularUsers} regular users`,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Total Admins",
      value: users.admins,
      icon: <IconShieldCheck className="w-6 h-6 text-blue-600" />,
      roles: ["admin"],
    },
    {
      title: "Total Volunteers",
      value: users.volunteers,
      icon: <IconHeart className="w-6 h-6 text-purple-600" />,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Total Donations",
      value: donations.total,
      icon: <IconDroplet className="w-6 h-6 text-red-600" />,
      subtitle: `${donations.verified} verified`,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Pending Requests",
      value: requests.pending,
      icon: <Gpu className="w-6 h-6 text-orange-600" />,
      subtitle: `${requests.inProgress} in progress`,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Successful Requests",
      value: requests.success,
      icon: <IconHeart className="w-6 h-6 text-green-600" />,
      subtitle: `${requests.total} total requests`,
      roles: ["admin", "volunteer"],
    },
  ];

  // ✅ Filter cards based on user role
  const visibleCards = cards.filter((card) => card.roles.includes(userRole));

  return (
    <div className="px-1 lg:px-6">
      <div className="grid grid-cols-3 md:grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {visibleCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            subtitle={card.subtitle}
          />
        ))}
      </div>

      {/* ✅ Recent Activity Section (Optional) */}
      {(userRole === "admin" || userRole === "volunteer") &&
        recentActivity.requests > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Recent Activity</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {recentActivity.requests}
                </span>
                <span className="text-xs text-gray-500">
                  New requests (7 days)
                </span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Recent Donations</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {recentActivity.donations}
                </span>
                <span className="text-xs text-gray-500">
                  Completed (7 days)
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

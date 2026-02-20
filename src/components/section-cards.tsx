"use client";
import { useSession } from "next-auth/react";
import {
  IconUsers,
  IconShieldCheck,
  IconHeart,
  IconDroplet,
  IconCalendar,
  IconAward,
} from "@tabler/icons-react";
import { Gpu } from "lucide-react";
import { useEffect, useState } from "react";
import SummarySkeleton from "./skeletons/SummarySkeleton";

interface SummaryData {
  totalUsers: number;
  totalAdmins: number;
  totalVolunteer: number;
  totalPending: number;
  totalInProgress: number;
  totalComplite: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      <p className="text-sm text-gray-600 font-medium mb-1 text-center">
        {title}
      </p>
      <div className="flex items-center justify-center gap-4 ">
        <div className="p-2  rounded">{icon}</div>
        <p className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export function SectionCards() {
  const [summaryData, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userRole = session?.user?.role || "user";
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/summary");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <SummarySkeleton />;
  }
  console.log(summaryData);
  const cards = [
    {
      title: "Total Users",
      value: summaryData?.totalUsers || 0,
      icon: <IconUsers className="w-6 h-6 text-gray-700" />,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Total Admins",
      value: summaryData?.totalAdmins || 0,
      icon: <IconShieldCheck className="w-6 h-6 text-gray-700" />,
      roles: ["admin"],
    },
    {
      title: "Total Volunteers",
      value: summaryData?.totalVolunteer || 0,
      icon: <IconHeart className="w-6 h-6 text-gray-700" />,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Lives Saved",
      value: summaryData?.totalComplite || 0,
      icon: <IconDroplet className="w-6 h-6 text-red-600" />,
      roles: ["admin", "volunteer"],
    },
    {
      title: "Pending Req",
      value: summaryData?.totalPending || 0,
      icon: <Gpu className="w-6 h-6 text-red-600" />,
      roles: ["admin", "volunteer"],
    },
  ];
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
          />
        ))}
      </div>
    </div>
  );
}

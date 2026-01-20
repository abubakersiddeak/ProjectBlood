import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconSettings,
} from "@tabler/icons-react";
import { CirclePlus, DollarSign, Loader } from "lucide-react";

const NAV_DATA = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Admin Dashboard",
      url: "/dashboard/admin",
      icon: IconDashboard,
      roles: ["ADMIN"],
    },
    {
      title: "Volunteer Panel",
      url: "/dashboard/volunteer",
      icon: IconListDetails,
      roles: ["VOLUNTEER", "ADMIN"],
    },
    // user dashboard
    {
      title: "User Dashboard",
      url: "/dashboard/user",
      icon: IconDashboard,
      roles: ["USER"],
    },
    {
      title: "My Blood Request",
      url: "/dashboard/user/myBloodRequest",
      icon: Loader,
      roles: ["USER"],
    },
    {
      title: "Create Blood Donation Request",
      url: "/dashboard/user/createRequest",
      icon: CirclePlus,
      roles: ["USER"],
    },
    {
      title: "Fund Donation Details",
      url: "/dashboard/user/fundDetails",
      icon: DollarSign,
      roles: ["USER"],
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
      roles: ["ADMIN", "VOLUNTEER", "USER"],
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
      roles: ["ADMIN", "VOLUNTEER", "USER"],
    },
  ],
};

/**
 * এই ফাংশনটি নির্দিষ্ট রোলের জন্য মেনু ডাটা রিটার্ন করবে
 */
export function getSidebarDataByRole(user: any) {
  const userRole = user?.role?.toUpperCase() ?? "GUEST";
  console.log(userRole);
  return {
    navMain: NAV_DATA.navMain.filter((item) => item.roles.includes(userRole)),

    navSecondary: NAV_DATA.navSecondary.filter((item) =>
      item.roles.includes(userRole),
    ),
    user: user,
  };
}

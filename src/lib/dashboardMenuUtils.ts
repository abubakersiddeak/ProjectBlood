import {
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import {
  BanknoteArrowDown,
  Cctv,
  CirclePlus,
  DollarSign,
  Loader,
} from "lucide-react";

const NAV_DATA = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    // admin dashboard
    {
      title: "Admin Dashboard",
      url: "/dashboard/admin",
      icon: IconDashboard,
      roles: ["ADMIN"],
    },
    {
      title: "All Users",
      url: "/dashboard/admin/allUsers",
      icon: IconUsers,
      roles: ["ADMIN"],
    },
    {
      title: "All Donation Request",
      url: "/dashboard/admin/allDonationRequest",
      icon: Loader,
      roles: ["ADMIN"],
    },
    {
      title: "Fund Details",
      url: "/dashboard/admin/fundDetails",
      icon: BanknoteArrowDown,
      roles: ["ADMIN"],
    },

    {
      title: "All Activities",
      url: "/dashboard/admin/allActivities",
      icon: Cctv,
      roles: ["ADMIN"],
    },
    {
      title: "Create Blood Request",
      url: "/dashboard/admin/createBloodRequest",
      icon: CirclePlus,
      roles: ["ADMIN"],
    },
    // Volunteer dashboard
    {
      title: "Volunteer Panel",
      url: "/dashboard/volunteer",
      icon: IconListDetails,
      roles: ["VOLUNTEER"],
    },
    {
      title: "All Users",
      url: "/dashboard/volunteer/allUsers",
      icon: IconUsers,
      roles: ["VOLUNTEER"],
    },
    {
      title: "All Donation Request",
      url: "/dashboard/volunteer/allDonationRequest",
      icon: Loader,
      roles: ["VOLUNTEER"],
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

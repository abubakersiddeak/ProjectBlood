"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { getSidebarDataByRole } from "@/lib/dashboardMenuUtils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { data: session, status } = useSession();
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-sm text-gray-500">Loading dashboard...</span>
      </div>
    );
  }
  const sidebarData = getSidebarDataByRole(session?.user);

  return (
    <SidebarProvider>
      {/* ১. ডাইনামিক সাইডবার যা রোল অনুযায়ী মেনু দেখাবে */}
      <AppSidebar sidebarData={sidebarData} />

      <SidebarInset>
        {/* ২. টপ নেভবার/হেডার সেকশন */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex justify-between items-center w-full">
            {" "}
            <div className="flex-1">
              <span className="font-bold text-gray-500 ">Welcome</span>
              <span className="font-bold text-gray-800">
                {" "}
                {session?.user?.name.toUpperCase()}
              </span>
            </div>
            <div className=" hidden md:flex text-xs lg:text-sm items-center space-x-3 xl:space-x-2">
              <Link
                href="/"
                className="text-gray-600 hover:text-red-500 lg:px-3 py-2"
              >
                Home
              </Link>
              <Link
                href="/allBloodRequest"
                className="text-gray-600 hover:text-red-500 lg:px-3 py-2"
              >
                All Requests
              </Link>
              <Link
                href="/searchDonors"
                className="text-gray-600 hover:text-red-500 lg:px-3 py-2"
              >
                Search Blood Donors
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t absolute w-full mt-46">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/allBloodRequest"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                All Blood Requests
              </Link>
              <Link
                href="/searchDonors"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Search Donors
              </Link>
            </div>
          )}
        </header>

        {/* ৩. মেইন পেজ কন্টেন্ট (admin/donor/manager pages) */}
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-slate-50/50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

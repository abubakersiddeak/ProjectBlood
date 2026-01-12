"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { LogOut, LayoutDashboard } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "@/hooks/useAuth";
import server from "@/lib/api";

// Assuming your User interface looks like this.
// You should ideally move this to a /types/index.ts file.
interface UserType {
  name: string;
  email: string;
  avatar: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // useAuth should return the UserType or null
  const { user } = useAuth() as { user: UserType | null };

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await server.post("/api/auth/logout");

          // Note: axios (server) usually uses res.status,
          // but if you're using fetch, it's res.ok.
          if (res.status !== 200) {
            throw new Error("Logout failed");
          }

          Swal.fire({
            icon: "success",
            title: "Logged Out Successfully",
            text: "You have been logged out.",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/";
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Something went wrong",
            text: "Please Retry.",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      }
    });
  }, []);

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 lg:px-3 2xl:px-0">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-red-500 flex items-center gap-2"
          >
            <Image
              src="/bloodlinkLogo.webp"
              alt="blood logo"
              height={50}
              width={50}
              priority
            />
            BloodLink BD
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex text-xs lg:text-sm items-center space-x-3 xl:space-x-2">
            <Link
              href="/"
              className="text-gray-600 hover:text-red-500 lg:px-3 py-2"
            >
              Home
            </Link>
            <Link
              href="/donation-requests"
              className="text-gray-600 hover:text-red-500 lg:px-3 py-2"
            >
              All Requests
            </Link>
            <Link
              href="/search"
              className="text-gray-600 hover:text-red-500 lg:px-3 py-2"
            >
              Search Donors
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-red-500 lg:px-3 py-2 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 border-red-500 border relative overflow-hidden flex items-center justify-center">
                      <Image
                        src={user.avatar || "/default-avatar.png"}
                        alt="User"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {user.name}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-red-500 text-white px-4 py-2 hover:bg-red-600"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
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
          <div className="md:hidden bg-white border-t">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {/* ... other mobile links ... */}
            {user && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOut, LayoutDashboard } from "lucide-react";
import Swal from "sweetalert2";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = () => {
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
      if (!result.isConfirmed) return;

      try {
        // IMPORTANT: redirect false
        await signOut({ redirect: false });

        Swal.fire({
          icon: "success",
          title: "Logged Out Successfully",
          timer: 1200,
          showConfirmButton: false,
        });

        router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
        Swal.fire({
          icon: "error",
          title: "Logout Failed",
          text: "Please try again",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 lg:px-3 2xl:px-0">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-2xl font-bold text-red-500 flex items-center gap-2"
          >
            <span className="text-2xl">
              <Image
                src={"/bloodlinkLogo.webp"}
                alt="blood logo"
                height={50}
                width={50}
              />
            </span>
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

            {session?.user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-red-500 lg:px-3 py-2 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 transition-colors cursor-pointer"
                    type="button"
                  >
                    <div className="w-8 h-8 border-red-500 border relative overflow-hidden flex items-center justify-center text-white font-semibold">
                      <Image
                        src={
                          session?.user?.avatar ||
                          "https://i.ibb.co.com/20yB5J5L/vecteezy-man-empty-avatar-vector-photo-placeholder-for-social-36594092.webp"
                        }
                        alt="User"
                        height={500}
                        width={500}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {session?.user?.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session?.user?.email}
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
                      {/* <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link> */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-200"
                        type="button"
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
          <div className="md:hidden bg-white border-t">
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

            {session?.user ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 bg-gray-50 border-y border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                      <Image
                        src={
                          session?.user?.avatar ||
                          "https://i.ibb.co.com/20yB5J5L/vecteezy-man-empty-avatar-vector-photo-placeholder-for-social-36594092.webp"
                        }
                        alt="User"
                        height={40}
                        width={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-200"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { BLOOD_GROUPS, months } from "../../lib/constants";
import {
  X,
  Droplet,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import server from "@/lib/api";
import { FIBloodDonationRequest } from "@/types/frontendModelInterface";
import ShowReqCard from "../card/ShowReqCard";
import ShowDonationReqDetailsModal from "../modal/ShowDonationReqDetailsModal";

interface Filters {
  search: string;
  bloodGroup: string;
  district: string;
}

// Helper function to check if request date is valid (not expired)
const isRequestValid = (donationDate: Date | string): boolean => {
  try {
    const requestDate = new Date(donationDate);
    const today = new Date();

    // Reset time to midnight for accurate date comparison
    today.setHours(0, 0, 0, 0);
    requestDate.setHours(0, 0, 0, 0);

    // Request is valid if donation date is today or in the future
    return requestDate >= today;
  } catch {
    return false;
  }
};

export default function AllBloodDonationReqPublic() {
  const [requests, setRequests] = useState<FIBloodDonationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] =
    useState<FIBloodDonationRequest | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const LIMIT = 12;

  const [filters, setFilters] = useState<Filters>({
    search: "",
    bloodGroup: "all",
    district: "",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        donationStatus: "pending",
        page: page,
        limit: LIMIT,
      };

      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.district.trim()) params.district = filters.district.trim();
      if (filters.bloodGroup !== "all") params.bloodGroup = filters.bloodGroup;

      const response = await server.get(
        "/api/bloodDonationReq/totalBloodDonationReqPublic",
        { params },
      );

      if (response.data.success) {
        // Filter out expired requests (past donation dates)
        const validRequests = (response.data.data || []).filter(
          (req: FIBloodDonationRequest) => isRequestValid(req.donationDate),
        );

        setRequests(validRequests);

        // Adjust pagination based on filtered results
        const filteredTotal = validRequests.length;
        const adjustedPages = Math.ceil(filteredTotal / LIMIT);

        setTotalPages(adjustedPages || 1);
        setTotalResults(filteredTotal);
      } else {
        setRequests([]);
        setTotalPages(1);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Failed to load blood donation requests:", error);
      setRequests([]);
      setTotalPages(1);
      setTotalResults(0);
      Swal.fire({
        title: "Error!",
        text: "Failed to load data. Please try again.",
        icon: "error",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", bloodGroup: "all", district: "" });
    setPage(1);
    setShowFilters(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatDate = useCallback((dateInput: Date | string): string => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "Invalid Date";

      return `${date.getDate()} ${months[date.getMonth()]}`;
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Check if date is today
  const isToday = useCallback((dateInput: Date | string): boolean => {
    try {
      const date = new Date(dateInput);
      const today = new Date();

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  }, []);

  // Pagination range calculator
  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    const maxVisible = 8;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(totalPages);
      } else if (page >= totalPages - 2) {
        range.push(1);
        range.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        range.push(1);
        range.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(totalPages);
      }
    }

    return range;
  }, [page, totalPages]);

  const hasActiveFilters = useMemo(
    () =>
      filters.search.trim() !== "" ||
      filters.bloodGroup !== "all" ||
      filters.district.trim() !== "",
    [filters],
  );

  return (
    <section className="bg-white  py-8 md:py-16 lg:py-20">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-10 border-b border-gray-200 pb-4 md:pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 md:mb-6 gap-3 md:gap-4">
            <div className="w-full sm:w-auto">
              <div className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-2 md:mb-3">
                Urgent
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black tracking-tight">
                Urgent <span className="text-red-600">Blood Needed</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 md:mt-2">
                Direct connection from donor to patient • Active requests only
              </p>
            </div>
            {totalResults > 0 && (
              <div className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-red-600">{totalResults}</span>{" "}
                active {totalResults === 1 ? "request" : "requests"}
              </div>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between border border-gray-300 px-4 py-3 text-sm font-bold hover:bg-gray-50 transition-colors mb-4"
          >
            <span className="flex items-center gap-2">
              <Filter size={16} />
              {hasActiveFilters ? "Active Filters" : "Filter Requests"}
            </span>
            <ChevronRight
              size={16}
              className={`transition-transform ${showFilters ? "rotate-90" : ""}`}
            />
          </button>

          {/* Filter Section */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            }  space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-3 lg:gap-4`}
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search name or hospital..."
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            <select
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-white appearance-none cursor-pointer"
            >
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              placeholder="Enter district/city..."
              className="w-full border border-gray-300 px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />

            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="w-full border border-gray-300 px-4 py-2.5 md:py-3 text-sm font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black flex items-center justify-center gap-2"
            >
              <X size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="w-full h-64 md:h-96 flex flex-col items-center justify-center border border-gray-200 bg-gray-50">
            <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-red-600 animate-spin mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-gray-500 font-medium">
              Loading requests...
            </p>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && requests.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 md:mb-12">
              {requests.map((req, index) => (
                <ShowReqCard
                  key={req._id}
                  request={req}
                  onClick={() => setSelectedRequest(req)}
                  formatDate={formatDate}
                  isToday={isToday}
                  index={index}
                />
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="space-y-4">
                {/* Mobile Pagination */}
                <div className="md:hidden flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex-1 h-10 px-3 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1 font-bold text-sm"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <div className="px-4 py-2 bg-black text-white font-bold text-sm whitespace-nowrap">
                    {page} / {totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex-1 h-10 px-3 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1 font-bold text-sm"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Desktop Pagination */}
                <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 font-medium">
                    Showing{" "}
                    <span className="text-black font-bold">
                      {(page - 1) * LIMIT + 1}
                    </span>{" "}
                    to{" "}
                    <span className="text-black font-bold">
                      {Math.min(page * LIMIT, totalResults)}
                    </span>{" "}
                    of{" "}
                    <span className="text-black font-bold">{totalResults}</span>{" "}
                    results
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="h-10 px-4 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {paginationRange.map((pageNum, index) => {
                        if (pageNum === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="h-10 w-10 flex items-center justify-center text-gray-400 font-bold"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(Number(pageNum))}
                            className={`h-10 w-10 flex items-center justify-center border transition-colors font-bold text-sm ${
                              page === pageNum
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-600 border-gray-300 hover:border-black"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="h-10 px-4 border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick Jump (Desktop) */}
                {totalPages > 5 && (
                  <div className="hidden lg:flex items-center justify-center gap-2 pt-2">
                    <span className="text-sm text-gray-500">Jump to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={page}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= totalPages) {
                          handlePageChange(value);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 text-center text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="border border-gray-300 p-8 md:p-12 text-center bg-gray-50">
            <Droplet className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-bold uppercase text-black mb-2">
              No Active Requests Found
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "No active blood donation requests match your filters. Try adjusting your search criteria."
                : "There are currently no active blood donation requests. All requests with past dates have been filtered out."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                <X size={16} />
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <ShowDonationReqDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            formatDate={formatDate}
            isToday={isToday}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

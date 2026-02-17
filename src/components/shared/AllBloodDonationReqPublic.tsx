"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BLOOD_GROUPS } from "../../lib/constants";
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Building2,
  X,
  ArrowRight,
  Droplet,
  Phone,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import server from "@/lib/api";
import { FIBloodDonationRequest } from "@/types/frontendModelInterface";

interface Filters {
  search: string;
  bloodGroup: string;
  district: string;
}

const URGENCY_LABELS: Record<string, string> = {
  Normal: "Normal",
  Urgent: "Urgent",
  Emergency: "Emergency",
};

const URGENCY_COLORS: Record<string, string> = {
  Emergency: "bg-red-600",
  Urgent: "bg-orange-600",
  Normal: "bg-black",
};

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

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
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
    const maxVisible = 5;

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
    <section className="bg-white min-h-screen py-8 md:py-16 lg:py-20">
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
                <MinimalCard
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
          <SquareModal
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

interface MinimalCardProps {
  request: FIBloodDonationRequest;
  onClick: () => void;
  formatDate: (date: Date | string) => string;
  isToday: (date: Date | string) => boolean;
  index: number;
}

function MinimalCard({
  request,
  onClick,
  formatDate,
  isToday,
  index,
}: MinimalCardProps) {
  const formattedDate = formatDate(request.donationDate);
  const isTodayRequest = isToday(request.donationDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative border border-gray-200 bg-white hover:border-red-200 transition-all duration-200 flex flex-col h-full cursor-pointer hover:shadow-xl active:scale-[0.98]"
      onClick={onClick}
    >
      {/* Today Badge */}
      {isTodayRequest && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase animate-pulse">
            Today
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex border-b border-gray-200 group-hover:border-red-100">
        <div className=" text-red-600 border-red-100 border-r w-10 sm:w-13 h-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
          {request.bloodGroup}
        </div>
        <div className="flex-1 p-1 sm:p-2 flex flex-col justify-center min-w-0">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            Needed
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 text-black font-medium text-xs sm:text-sm truncate">
            <Calendar size={12} className="shrink-0" />
            <span className="truncate">{formattedDate}</span>
            <span className="text-gray-300 shrink-0">|</span>
            <Clock size={12} className="shrink-0" />
            <span className="truncate">{request.donationTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 grow space-y-3 sm:space-y-4 relative">
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mb-1">
            Patient
          </p>
          <h3 className="text-base sm:text-lg font-bold text-black leading-tight truncate">
            {request.recipientName.toLocaleUpperCase()}
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 sm:gap-3">
            <Building2 size={14} className="mt-0.5 text-gray-400 shrink-0" />
            <span className="text-xs sm:text-sm text-gray-800 line-clamp-2">
              {request.hospitalName}
            </span>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <MapPin size={14} className="mt-0.5 text-gray-400 shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {request.location?.city || request.location?.address || "N/A"}
            </span>
          </div>
        </div>

        {request.urgency && request.urgency !== "Normal" && (
          <div
            className={`inline-block px-2 py-1 bottom-0 right-0 absolute text-[10px] sm:text-xs font-bold ${
              request.urgency === "Emergency"
                ? "bg-red-100 text-red-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {URGENCY_LABELS[request.urgency] || request.urgency}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-100 mt-auto bg-gray-50 group-hover:bg-red-50 transition-colors duration-200">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-widest">
          <span>View Details</span>
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface SquareModalProps {
  request: FIBloodDonationRequest;
  onClose: () => void;
  formatDate: (date: Date | string) => string;
  isToday: (date: Date | string) => boolean;
}

function SquareModal({
  request,
  onClose,
  formatDate,
  isToday,
}: SquareModalProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const router = useRouter();
  const isTodayRequest = isToday(request.donationDate);

  const handleDonate = async () => {
    const result = await Swal.fire({
      title: "Confirm Donation",
      text: `Are you sure you want to donate blood to ${request.recipientName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#000000",
      confirmButtonText: "Yes, I will donate",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-none border-2 border-black",
        confirmButton:
          "rounded-none font-bold uppercase px-4 sm:px-6 py-2 sm:py-3 text-sm",
        cancelButton:
          "rounded-none font-bold uppercase px-4 sm:px-6 py-2 sm:py-3 text-sm",
        title: "font-bold text-base sm:text-lg",
      },
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      Swal.fire({
        title: "Processing...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        customClass: { popup: "rounded-none border-2 border-black" },
      });

      try {
        const response = await server.put(
          `/api/bloodDonationReq/${request._id}/donate`,
        );
        console.log(response);
        if (response.data.success) {
          await Swal.fire({
            title: "Accepted!",
            text: "Thank you! Check your history for details.",
            icon: "success",
            confirmButtonColor: "#dc2626",
            confirmButtonText: "OK",
            customClass: {
              popup: "rounded-none border-2 border-black",
              confirmButton: "rounded-none font-bold uppercase px-6 py-3",
            },
          });
          onClose();
          window.location.reload();
        }
        if (response.status === 400) {
          await Swal.fire({
            title: "Opps!",
            text: "You have already responded to this request",
            icon: "error",
            confirmButtonColor: "#dc2626",
            confirmButtonText: "OK",
            customClass: {
              popup: "rounded-none border-2 border-black",
              confirmButton: "rounded-none font-bold uppercase px-6 py-3",
            },
          });
          onClose();
          window.location.reload();
        }
      } catch (error: any) {
        Swal.close();
        if (error.response?.status === 401) {
          const result = await Swal.fire({
            title: "Registration Required",
            html: "You must be a registered donor to accept requests.<br/>It only takes one minute!",
            icon: "info",
            confirmButtonText: "Register as Donor",
            confirmButtonColor: "#000000",
            showCancelButton: true,
            cancelButtonText: "Later",
            customClass: {
              popup: "rounded-none border-2 border-black",
              confirmButton:
                "rounded-none font-bold uppercase px-4 sm:px-6 py-2 sm:py-3 text-sm",
              cancelButton:
                "rounded-none font-bold uppercase px-4 sm:px-6 py-2 sm:py-3 text-sm",
            },
          });
          if (result.isConfirmed) {
            router.push("/registerDonor");
          }
        } else {
          const errorMsg =
            error.response?.data?.message || "Something went wrong.";
          Swal.fire({
            title: "Error",
            text: errorMsg,
            icon: "error",
            confirmButtonColor: "#000000",
            confirmButtonText: "OK",
            customClass: {
              popup: "rounded-none border-2 border-black",
              confirmButton: "rounded-none font-bold uppercase px-6 py-3",
            },
          });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", scale: 1 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%", scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-3xl sm:max-h-[90vh] h-full sm:h-auto flex flex-col sm:border sm:border-gray-500 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-stretch border-b border-black/30 h-16 sm:h-20 shrink-0 relative">
          {isTodayRequest && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase animate-pulse shadow-lg">
                Needed Today!
              </span>
            </div>
          )}
          <div className="bg-red-600 text-white px-6 sm:px-10 flex items-center justify-center text-2xl sm:text-3xl font-black">
            {request.bloodGroup}
          </div>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 cursor-pointer hover:bg-black hover:text-white transition-colors border-l border-gray-200"
            aria-label="Close modal"
          >
            <X size={24} className="sm:w-7 sm:h-7" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-y-auto">
          {/* Left Panel */}
          <div className="p-5 sm:p-8 lg:p-10 w-full sm:w-1/2 space-y-6 sm:space-y-8 border-b sm:border-b-0 sm:border-r border-gray-200">
            <div>
              {request.urgency && (
                <span
                  className={`inline-block text-white text-xs font-bold px-2 py-1 mb-3 sm:mb-4 uppercase ${
                    URGENCY_COLORS[request.urgency] || "bg-black"
                  }`}
                >
                  {URGENCY_LABELS[request.urgency] || request.urgency} Request
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-1">
                {request.recipientName}
              </h2>
              <p className="text-gray-500 text-sm">Patient</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <InfoRow
                icon={<Building2 size={16} className="sm:w-5 sm:h-5" />}
                label="Hospital"
                value={request.hospitalName}
              />
              <InfoRow
                icon={<MapPin size={16} className="sm:w-5 sm:h-5" />}
                label="Address"
                value={request.location?.address || "N/A"}
              />
              <InfoRow
                icon={<Calendar size={16} className="sm:w-5 sm:h-5" />}
                label="Date & Time"
                value={`${formatDate(request.donationDate)} - ${request.donationTime}${isTodayRequest ? " (Today)" : ""}`}
              />
              <InfoRow
                icon={<Droplet size={16} className="sm:w-5 sm:h-5" />}
                label="Units Needed"
                value={`${request.totalUnitsNeeded} bags (${request.unitsFulfilled || 0} fulfilled)`}
              />
            </div>

            {request.additionalMessage && (
              <div className="bg-gray-50 p-3 sm:p-4 border border-gray-200 text-sm italic text-gray-600">
                <p className="font-bold text-xs text-gray-400 mb-2">
                  Additional Message:
                </p>
                <p className="text-xs sm:text-sm">
                  {request.additionalMessage}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="p-5 sm:p-8 lg:p-10 w-full sm:w-1/2 flex flex-col justify-between bg-gray-50/50">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-bold uppercase border-b border-gray-300 pb-2">
                Contact Information
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Patient Phone
                  </p>
                  <a
                    href={`tel:${request.recipientPhone}`}
                    className="text-lg sm:text-xl font-bold text-black hover:text-red-600 underline decoration-1 underline-offset-4 break-all"
                  >
                    {request.recipientPhone}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                    Posted By
                  </p>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                      {request.requesterId?.fullName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-0 space-y-3">
              <button
                onClick={handleDonate}
                disabled={isProcessing}
                className={`w-full ${isTodayRequest ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"} text-white h-12 sm:h-14 font-bold uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Droplet size={18} className="sm:w-5 sm:h-5" />I Will Donate{" "}
                    {isTodayRequest && "Today"}
                  </>
                )}
              </button>
              <a
                href={`tel:${request.recipientPhone}`}
                className="w-full bg-white border border-black text-black h-12 sm:h-14 font-bold uppercase tracking-widest hover:bg-black hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Phone size={18} className="sm:w-5 sm:h-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="mt-0.5 text-black shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug wrap-break-word">
          {value}
        </p>
      </div>
    </div>
  );
}

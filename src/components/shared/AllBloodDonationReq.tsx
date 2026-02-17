"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Building2,
  X,
  Droplet,
  ChevronLeft,
  ChevronRight,
  Phone,
  Plus,
  Search,
  Filter,
  Eye,
  Loader2,
} from "lucide-react";

import server from "@/lib/api";
import { Button } from "../ui/button";
import AddDonationReqModal from "../modal/AddDonationReqModal";
import ReqDetailModal from "../modal/ReqDetailModal";
import { IDonationRequest } from "@/types/reqTyps";
import { BLOOD_GROUPS } from "@/lib/constants";

// ===========================
// Types & Constants
// ===========================

interface FilterState {
  search: string;
  bloodGroup: string;
  district: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status", color: "gray" },
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "in-progress", label: "In Progress", color: "blue" },
  { value: "success", label: "Completed", color: "green" },
] as const;

const ITEMS_PER_PAGE = 10;

export default function AllBloodDonationReq() {
  // State Management
  const [requests, setRequests] = useState<IDonationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] =
    useState<IDonationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    bloodGroup: "All",
    district: "",
    status: "all",
  });

  // Data Fetching

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: 1,
        limit: 500, // Fetch all for client-side filtering
      };

      // Only fetch specific status if not "all"
      if (filters.status !== "all") {
        params.status = filters.status;
      }

      const response = await server.get(
        "/api/bloodDonationReq/totalBloodDonationReqPublic",
        { params },
      );

      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch donation requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filtered & Paginated Data

  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.recipientName.toLowerCase().includes(searchLower) ||
          req.hospitalName.toLowerCase().includes(searchLower) ||
          req.location.address.toLowerCase().includes(searchLower) ||
          req.location.city?.toLowerCase().includes(searchLower),
      );
    }

    // Blood group filter
    if (filters.bloodGroup !== "All") {
      filtered = filtered.filter(
        (req) => req.bloodGroup === filters.bloodGroup,
      );
    }

    // District filter
    if (filters.district.trim()) {
      const districtLower = filters.district.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.location.city?.toLowerCase().includes(districtLower) ||
          req.location.address.toLowerCase().includes(districtLower),
      );
    }

    return filtered;
  }, [requests, filters]);

  const totalPages = useMemo(
    () => Math.ceil(filteredRequests.length / ITEMS_PER_PAGE),
    [filteredRequests.length],
  );

  const paginatedRequests = useMemo(
    () =>
      filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filteredRequests, currentPage],
  );

  // Statistics

  const stats = useMemo(() => {
    const all = requests.length;
    const pending = requests.filter(
      (r) => r.donationStatus === "pending",
    ).length;
    const inProgress = requests.filter(
      (r) => r.donationStatus === "in-progress",
    ).length;
    const completed = requests.filter(
      (r) => r.donationStatus === "success",
    ).length;

    return { all, pending, inProgress, completed };
  }, [requests]);

  // Handlers

  const resetFilters = useCallback(() => {
    setFilters({ search: "", bloodGroup: "All", district: "", status: "all" });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages],
  );

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [],
  );

  const hasActiveFilters = useMemo(
    () =>
      filters.search ||
      filters.bloodGroup !== "All" ||
      filters.district ||
      filters.status !== "all",
    [filters],
  );

  return (
    <section className="bg-gray-50 min-h-screen py-4 sm:py-6">
      <div className=" px-3 sm:px-4 lg:px-6 mx-auto">
        {/* Header */}
        <div className="bg-white border-b-4 border-red-600 p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                Blood Donation Requests
              </h1>
              <p className="text-sm text-gray-600">
                View all urgent blood donation requests
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-4 sm:px-6 py-2.5 font-bold cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Request</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <StatCard
            label="Total"
            value={stats.all}
            color="gray"
            active={filters.status === "all"}
            onClick={() => handleFilterChange("status", "all")}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="yellow"
            active={filters.status === "pending"}
            onClick={() => handleFilterChange("status", "pending")}
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="blue"
            active={filters.status === "in-progress"}
            onClick={() => handleFilterChange("status", "in-progress")}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="green"
            active={filters.status === "success"}
            onClick={() => handleFilterChange("status", "success")}
          />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 mb-4 sm:mb-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden cursor-pointer"
            >
              {showFilters ? "Hide" : "Show"}
            </Button>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 ${
              showFilters ? "block" : "hidden sm:grid"
            }`}
          >
            {/* Search */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Name, hospital or location..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 focus:border-red-600 outline-none text-sm transition-colors"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Blood Group
              </label>
              <select
                value={filters.bloodGroup}
                onChange={(e) =>
                  handleFilterChange("bloodGroup", e.target.value)
                }
                className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-red-600 outline-none text-sm cursor-pointer transition-colors bg-white"
              >
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                District/Area
              </label>
              <input
                type="text"
                value={filters.district}
                onChange={(e) => handleFilterChange("district", e.target.value)}
                placeholder="Enter district..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-red-600 outline-none text-sm transition-colors"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Total{" "}
              <span className="font-bold text-red-600">
                {filteredRequests.length}
              </span>{" "}
              requests
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : filteredRequests.length > 0 ? (
          <>
            {/* Desktop Table */}
            <DesktopTable
              requests={paginatedRequests}
              onViewDetails={setSelectedRequest}
            />

            {/* Mobile Cards */}
            <MobileCards
              requests={paginatedRequests}
              onViewDetails={setSelectedRequest}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <EmptyState resetFilters={resetFilters} />
        )}
      </div>

      {/* Modals */}
      <AddDonationReqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchRequests();
        }}
      />

      <AnimatePresence>
        {selectedRequest && (
          <ReqDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ===========================
// Sub Components
// ===========================

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  color: "gray" | "yellow" | "blue" | "green";
  active: boolean;
  onClick: () => void;
}

function StatCard({ label, value, color, active, onClick }: StatCardProps) {
  const colorClasses = {
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-800",
      activeBg: "bg-gray-100",
      activeBorder: "border-gray-400",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      activeBg: "bg-yellow-100",
      activeBorder: "border-yellow-400",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      activeBg: "bg-blue-100",
      activeBorder: "border-blue-400",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      activeBg: "bg-green-100",
      activeBorder: "border-green-400",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 ${active ? classes.activeBorder : classes.border} ${active ? classes.activeBg : classes.bg} cursor-pointer transition-all hover:shadow-md ${active ? "shadow-md" : ""}`}
    >
      <div
        className={`text-2xl sm:text-3xl font-black ${classes.text} text-center`}
      >
        {value}
      </div>
      <div className="text-xs font-bold text-gray-600 text-center uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

// Desktop Table
function DesktopTable({
  requests,
  onViewDetails,
}: {
  requests: IDonationRequest[];
  onViewDetails: (req: IDonationRequest) => void;
}) {
  return (
    <div className="hidden lg:block bg-white shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                Blood Group
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-red-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-red-600 text-white font-black text-lg">
                    {req.bloodGroup}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-bold text-gray-900">
                    {req.recipientName}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {req.hospitalName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {req.location.city || req.location.address}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-3.5 h-3.5 text-red-600" />
                      {new Date(req.donationDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {req.donationTime}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <a
                    href={`tel:${req.recipientPhone}`}
                    className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    {req.recipientPhone}
                  </a>
                </td>
                <td className="px-4 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(req)}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Mobile Cards
function MobileCards({
  requests,
  onViewDetails,
}: {
  requests: IDonationRequest[];
  onViewDetails: (req: IDonationRequest) => void;
}) {
  return (
    <div className="lg:hidden space-y-4">
      {requests.map((req, index) => (
        <motion.div
          key={req._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border-2 border-gray-200 shadow-md overflow-hidden"
        >
          <div className="bg-red-600 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 flex items-center justify-center text-white font-black text-lg">
                {req.bloodGroup}
              </div>
              <div className="text-white">
                <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Urgent
                </div>
                <div className="font-black text-sm">Blood Needed</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(req)}
              className="text-white hover:bg-white/20 cursor-pointer"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                Patient Name
              </span>
              <div className="font-black text-gray-900">
                {req.recipientName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                  Date
                </span>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  {new Date(req.donationDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                  Time
                </span>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  {req.donationTime}
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                Hospital
              </span>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                <span className="line-clamp-2">{req.hospitalName}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                Location
              </span>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                <span className="line-clamp-2">
                  {req.location.city || req.location.address}
                </span>
              </div>
            </div>

            <a
              href={`tel:${req.recipientPhone}`}
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2.5 font-bold cursor-pointer transition-colors"
            >
              <Phone className="w-4 h-4" />
              {req.recipientPhone}
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Pagination
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t-2 border-gray-200">
      <p className="text-sm text-gray-600 font-medium order-2 sm:order-1">
        Page <span className="text-red-600 font-bold">{currentPage}</span> of{" "}
        <span className="font-bold">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 bg-red-600 text-white font-bold text-sm">
          {currentPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-sm transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-300">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
      <p className="text-gray-700 font-bold">Loading requests...</p>
    </div>
  );
}

// Empty State
function EmptyState({ resetFilters }: { resetFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-gray-300 text-center px-4">
      <Droplet className="w-16 h-16 text-red-600 mb-4" />
      <h3 className="text-2xl font-black text-gray-900 mb-2">
        No Requests Found
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        There are no blood donation requests matching your selected filters.
      </p>
      <button
        onClick={resetFilters}
        className="bg-red-600 hover:bg-red-700 text-white px-8 h-12 font-bold uppercase tracking-wider cursor-pointer transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}

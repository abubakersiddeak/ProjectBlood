"use client";

import { useEffect, useState, useCallback } from "react";

import { Loader2, Droplet } from "lucide-react";
import { months } from "@/lib/constants";
import ShowReqCard from "@/components/card/ShowReqCard";
import { FIBloodDonationRequest } from "@/types/frontendModelInterface";
import { AnimatePresence } from "framer-motion";
import ShowDonationReqDetailsModal from "@/components/modal/ShowDonationReqDetailsModal";

export default function MatchingBloodReqWithUser() {
  const [requests, setRequests] = useState<FIBloodDonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<FIBloodDonationRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/bloodDonationReq/matching");
      const data = await res.json();

      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Failed to load matching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatDate = useCallback((dateInput: string | Date) => {
    const date = new Date(dateInput);
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }, []);

  const isToday = useCallback((dateInput: string | Date) => {
    const date = new Date(dateInput);
    const today = new Date();
    console.log(requests, "req is ");
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  if (loading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center border border-gray-200 bg-gray-50">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
        <p className="text-gray-500">Loading matching requests...</p>
      </div>
    );
  }

  if (!loading && requests.length === 0) {
    return (
      <div className="border border-gray-200 p-12 text-center bg-gray-50">
        <Droplet className="w-14 h-14 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-black mb-2">
          No Matching Requests
        </h3>
        <p className="text-gray-500 text-sm">
          Currently there are no blood requests matching your blood group.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white min-h-screen py-10">
      <div className=" mx-auto px-4">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-3">
            Matching
          </div>

          <h1 className="text-3xl font-bold text-black">
            Blood Requests <span className="text-red-600">For You</span>
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Requests that match your blood group
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {requests.map((req, index) => (
            <ShowReqCard
              onClick={() => setSelectedRequest(req)}
              key={req._id}
              request={req}
              index={index}
              formatDate={formatDate}
              isToday={isToday}
            />
          ))}
        </div>
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

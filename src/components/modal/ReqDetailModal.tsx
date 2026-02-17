import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Building2,
  X,
  Droplet,
  Phone,
  AlertCircle,
} from "lucide-react";

import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { IDonationRequest } from "@/types/reqTyps";
import server from "@/lib/api";

// --- Detail Modal ---
interface DetailModalProps {
  request: IDonationRequest;
  onClose: () => void;
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="border-2 border-gray-200 p-3">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
        {label}
      </span>
      <div className="flex items-start gap-2">
        {icon}
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

export default function ReqDetailModal({ request, onClose }: DetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleDonate = async () => {
    const result = await Swal.fire({
      title: "Confirm Donation",
      text: `Do you agree to donate blood for ${request.recipientName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, I want to donate",
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      try {
        const response = await server.put(
          `/api/bloodDonationReq/${request._id}/donate`,
        );
        if (response.data.success) {
          await Swal.fire({
            title: "Success!",
            text: "Your donation interest has been recorded.",
            icon: "success",
            confirmButtonColor: "#dc2626",
          });
          onClose();
          window.location.reload();
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push("/login?callbackUrl=/");
        } else {
          Swal.fire({
            title: "Failed",
            text: error.response?.data?.message || "An error occurred.",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  console.log(request);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-black p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500 flex items-center justify-center text-white font-black text-2xl">
              {request.bloodGroup}
            </div>
            <div className="text-white">
              <h2 className="font-black text-lg">Blood Donation Request</h2>
              <p className="text-sm opacity-90">Detailed Information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <InfoBox label="Patient Name" value={request.recipientName} />
          <InfoBox
            label="Hospital"
            value={request.hospitalName}
            icon={<Building2 className="w-4 h-4 text-red-600" />}
          />
          <InfoBox
            label="Address"
            value={`${request.location.city}, ${request.location.address}`}
            icon={<MapPin className="w-4 h-4 text-red-600" />}
          />

          <div className="grid grid-cols-2 gap-4">
            <InfoBox
              label="Date"
              value={new Date(request.donationDate).toLocaleDateString(
                "en-US",
                { day: "numeric", month: "long", year: "numeric" },
              )}
              icon={<Calendar className="w-4 h-4 text-red-600" />}
            />
            <InfoBox
              label="Time"
              value={request.donationTime}
              icon={<Clock className="w-4 h-4 text-red-600" />}
            />
          </div>

          {request.additionalMessage && (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-800 block mb-1">
                    Additional Information
                  </span>
                  <p className="text-sm text-gray-700">
                    {request.additionalMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-900 p-4 text-white">
            <span className="text-xs font-bold uppercase tracking-wider block mb-3 text-gray-400">
              Contact
            </span>
            <a
              href={`tel:${request.recipientPhone}`}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5 text-red-500" />
              <span className="font-black text-lg">
                {request.recipientPhone}
              </span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t-2 border-gray-200">
          <button
            onClick={handleDonate}
            disabled={isProcessing}
            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 sm:h-14 font-black uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Droplet className="w-5 h-5 fill-current" />
                Save a Life
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

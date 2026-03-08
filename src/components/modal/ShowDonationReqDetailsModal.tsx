import server from "@/lib/api";
import { FIBloodDonationRequest } from "@/types/frontendModelInterface";
import {
  Building2,
  Calendar,
  Droplet,
  Loader2,
  MapPin,
  MessageCircleMore,
  Phone,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Swal from "sweetalert2";

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
interface ShowDonationReqDetailsModalProps {
  request: FIBloodDonationRequest;
  onClose: () => void;
  formatDate: (date: Date | string) => string;
  isToday: (date: Date | string) => boolean;
}
export default function ShowDonationReqDetailsModal({
  request,
  onClose,
  formatDate,
  isToday,
}: ShowDonationReqDetailsModalProps) {
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
  console.log("req is now", request);
  return (
    <div>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-3xl sm:max-h-[90vh] h-full sm:h-auto flex flex-col sm:border sm:border-gray-500 shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-stretch border-b border-black/30 h-16 sm:h-20 shrink-0 relative">
            {isTodayRequest && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
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
            <div className="p-5 sm:p-8 lg:p-10 w-full sm:w-1/2 flex flex-col justify-between bg-gray-50/50 relative">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-bold uppercase border-b border-gray-300 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="right-10 absolute">
                    <MessageCircleMore
                      className="cursor-pointer hover:scale-110 "
                      onClick={() => {
                        router.push(
                          `/testsocket?userId=${request?.requesterId?._id}&name=${request?.requesterId?.fullName}`,
                        );
                      }}
                    />
                  </div>
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
                  className={`w-full ${isTodayRequest ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"} text-white h-12 sm:h-14 font-bold uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Droplet size={18} className="sm:w-5 sm:h-5" />I Will
                      Donate {isTodayRequest && "Today"}
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
        </div>
      </div>
    </div>
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

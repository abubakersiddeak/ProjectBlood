import { FIBloodDonationRequest } from "@/types/frontendModelInterface";
import { ArrowRight, Building2, Calendar, Clock, MapPin } from "lucide-react";
import React from "react";

const URGENCY_LABELS: Record<string, string> = {
  Normal: "Normal",
  Urgent: "Urgent",
  Emergency: "Emergency",
};
interface ShowReqCardProps {
  request: FIBloodDonationRequest;
  onClick: () => void;
  formatDate: (date: Date | string) => string;
  isToday: (date: Date | string) => boolean;
  index: number;
}

export default function ShowReqCard({
  request,
  onClick,
  formatDate,
  isToday,
}: ShowReqCardProps) {
  const formattedDate = formatDate(request.donationDate);
  const isTodayRequest = isToday(request.donationDate);
  return (
    <div>
      <div
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
                {request.hospitalName.toLocaleUpperCase()}
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
      </div>
    </div>
  );
}

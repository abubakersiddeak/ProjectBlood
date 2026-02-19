import {
  MapPin,
  Phone,
  User,
  Calendar,
  Heart,
  MessageCircleMore,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

interface Donor {
  avatar: string;
  _id: string;
  fullName: string;
  bloodGroup: string;
  phone?: string;
  email?: string;
  address?: string;
  lastDonation?: string | Date;
  totalDonation: number;
}
interface DonorCardProps {
  donor: Donor;
}
export default function DonorCard({ donor }: DonorCardProps) {
  const lastDonationDate = donor.lastDonation
    ? new Date(donor.lastDonation).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
  console.log(donor);
  const handlaeMassageClick = () => {
    alert("massage feature is not avalavle now");
  };
  return (
    <div className="relative border border-gray-200 bg-white flex flex-col h-full hover:border-red-400/50 transition-colors duration-200 shadow-sm hover:shadow-lg">
      <div className="flex border-b border-gray-200">
        {/* Blood Group Badge */}
        <div className=" text-red-600 border-r border-red-200 w-13 h-13 flex items-center justify-center text-2xl font-bold shrink-0">
          {donor.bloodGroup}
        </div>

        <div className="flex-1 p-1 flex flex-col justify-center min-w-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Donor Name
          </span>
          <h3 className="text-xs font-extrabold text-black leading-tight truncate">
            {donor.fullName.toLocaleUpperCase()}
          </h3>
        </div>
        <div>
          <Image
            src={donor.avatar}
            alt="img"
            height={50}
            width={50}
            className="w-13 h-13"
          />
        </div>
      </div>

      <div className="p-5 grow space-y-4 relative">
        <Button
          onClick={handlaeMassageClick}
          className="absolute cursor-pointer hover:bg-transparent hover:scale-110 right-0 top-2 bg-transparent text-black "
        >
          <MessageCircleMore />
        </Button>
        <div className="space-y-2">
          {/* Phone */}
          {donor.phone && (
            <div className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 text-gray-400 shrink-0" />
              <a
                href={`tel:${donor.phone}`}
                className="text-sm text-gray-800 line-clamp-1 hover:text-red-600 font-medium"
              >
                {donor.phone}
              </a>
            </div>
          )}

          {/* Address */}
          {donor.address && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600 line-clamp-2">
                {donor.address}
              </span>
            </div>
          )}

          {/* Last Donation */}
          <div className="flex items-start gap-3">
            <Calendar size={16} className="mt-0.5 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 font-medium">
              <span className="font-bold text-gray-800">Last Donation:</span>{" "}
              {lastDonationDate}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Heart size={16} className="mt-0.5 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 font-medium">
              <span className="font-bold text-gray-800">Total Donation:</span>{" "}
              {donor.totalDonation}
            </span>
          </div>
        </div>
      </div>

      {/* Footer/Action */}
      <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50">
        <div className="flex items-center justify-between text-xs font-bold tracking-widest text-black">
          <span className="truncate">{donor.email || "No email"}</span>
          <User size={16} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

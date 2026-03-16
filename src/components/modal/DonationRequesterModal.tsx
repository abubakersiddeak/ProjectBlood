"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import server from "@/lib/api";
import { toast } from "sonner";

interface DonationRequesterModalProps {
  open: boolean;
  onClose: () => void;
  donor: any;
  request: any;
}
export default function DonationRequesterModal({
  open,
  onClose,
  donor,
  request,
}: DonationRequesterModalProps) {
  if (!donor || !request) return null;
  const handleConfirmDonation = async () => {
    try {
      const { data, ok } = await server.post("/api/completeDonation", {
        requestId: request._id,
        donorId: donor.donorId._id,
        requesterId: request.requesterId,
        bloodGroup: request.bloodGroup,
        hospitalName: request.hospitalName,
        unitsDonated: 1,
      });

      if (ok && data.success) {
        toast.success("Donation confirmed successfully");
        onClose();
      } else {
        toast.error(data.message || "Failed to confirm donation");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  const handleCancelInterestedDonor = async () => {
    try {
      const { data, ok } = await server.patch("/api/removeDonor", {
        requestId: request._id,
        donorId: donor.donorId._id,
      });

      if (ok && data.success) {
        toast.success("Donor removed from request");

        onClose();
      } else {
        toast.error(data.message || "Failed to remove donor");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle>Donor Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* profile */}
          <div className="flex items-center gap-3">
            <Image
              src={donor.donorId.avatar}
              width={60}
              height={60}
              alt="donor"
              className="rounded-none"
            />

            <div>
              <h2 className="font-semibold text-lg">
                {donor.donorId.fullName}
              </h2>

              <p className="text-sm text-gray-500">
                Blood Group:{" "}
                <span className="text-red-500 font-bold">
                  {donor.donorId.bloodGroup}
                </span>
              </p>
            </div>
          </div>

          {/* info */}
          <div className="text-sm space-y-2">
            <p>
              <span className="text-gray-500">Phone:</span>{" "}
              {donor.donorId.phone}
            </p>

            <p>
              <span className="text-gray-500">Donation Count:</span>{" "}
              {donor.donorId.donationCount}
            </p>

            <p>
              <span className="text-gray-500">Applied At:</span>{" "}
              {new Date(donor.appliedAt).toLocaleDateString()}
            </p>
          </div>

          {/* actions */}
          <div className="flex gap-2 pt-3">
            <Button
              onClick={handleConfirmDonation}
              className="flex-1 bg-green-600 hover:bg-green-700 rounded-none cursor-pointer"
            >
              Complete
            </Button>
            <Button
              onClick={handleCancelInterestedDonor}
              variant="outline"
              className="flex-1 rounded-none cursor-pointer text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

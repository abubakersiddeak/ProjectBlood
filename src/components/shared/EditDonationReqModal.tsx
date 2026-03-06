"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { IDonationRequest } from "@/types/reqTyps";
import { Loader2 } from "lucide-react";
import server from "@/lib/api";
import { BLOOD_GROUPS, DONATION_STATUS, URGENCY_LEVELS } from "@/lib/constants";

interface EditDonationReqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: IDonationRequest | null;
}

export default function EditDonationReqModal({
  isOpen,
  onClose,
  onSuccess,
  request,
}: EditDonationReqModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: "",
    bloodGroup: "",
    totalUnitsNeeded: 1,
    urgency: "Normal",
    hospitalName: "",
    recipientPhone: "",
    city: "",
    address: "",
    donationDate: "",
    donationTime: "",
    additionalMessage: "",
    donationStatus: "pending",
  });

  // Populate form when request data is available
  useEffect(() => {
    if (request) {
      setFormData({
        recipientName: request.recipientName || "",
        bloodGroup: request.bloodGroup || "",
        totalUnitsNeeded: request.totalUnitsNeeded || 1,
        urgency: request.urgency || "Normal",
        hospitalName: request.hospitalName || "",
        recipientPhone: request.recipientPhone || "",
        city: request.location?.city || "",
        address: request.location?.address || "",
        donationDate: request.donationDate
          ? new Date(request.donationDate).toISOString().split("T")[0]
          : "",
        donationTime: request.donationTime || "",
        additionalMessage: request.additionalMessage || "",
        donationStatus: request.donationStatus || "pending",
      });
    }
  }, [request]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalUnitsNeeded" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request?._id) {
      toast.error("Request ID not found");
      return;
    }

    // Validation
    if (!formData.recipientName.trim()) {
      toast.error("Please enter recipient name");
      return;
    }

    if (!formData.hospitalName.trim()) {
      toast.error("Please enter hospital name");
      return;
    }

    if (!formData.recipientPhone.trim()) {
      toast.error("Please enter contact phone");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter city");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        recipientName: formData.recipientName,
        bloodGroup: formData.bloodGroup,
        totalUnitsNeeded: formData.totalUnitsNeeded,
        urgency: formData.urgency,
        hospitalName: formData.hospitalName,
        recipientPhone: formData.recipientPhone,
        location: {
          city: formData.city,
          address: formData.address,
          type: "Point",
          coordinates: request.location?.coordinates || [0, 0],
        },
        donationDate: formData.donationDate,
        donationTime: formData.donationTime,
        additionalMessage: formData.additionalMessage,
        donationStatus: formData.donationStatus,
      };

      const { data, ok } = await server.patch(
        `/api/bloodDonationReq/${request._id}`,
        updateData,
      );

      if (ok && data.success) {
        toast.success(data.message || "Request updated successfully!");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("An error occurred while updating the request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Blood Donation Request
          </DialogTitle>
          <DialogDescription>
            Update the details of your blood donation request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recipient Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipientName">
                  Recipient Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Enter recipient name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone">
                  Contact Phone <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="recipientPhone"
                  name="recipientPhone"
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  placeholder="+880 1234-567890"
                  required
                />
              </div>
            </div>
          </div>

          {/* Blood Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Blood Requirements
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">
                  Blood Group <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) =>
                    handleSelectChange("bloodGroup", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalUnitsNeeded">
                  Units Needed <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="totalUnitsNeeded"
                  name="totalUnitsNeeded"
                  type="number"
                  min="1"
                  value={formData.totalUnitsNeeded}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">
                  Urgency <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) =>
                    handleSelectChange("urgency", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level, index) => (
                      <SelectItem key={index} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hospital & Location
            </h3>

            <div className="space-y-2">
              <Label htmlFor="hospitalName">
                Hospital Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="Enter hospital name"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Date & Time
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="donationDate">Donation Date</Label>
                <Input
                  id="donationDate"
                  name="donationDate"
                  type="date"
                  value={formData.donationDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationTime">Donation Time</Label>
                <Input
                  id="donationTime"
                  name="donationTime"
                  type="time"
                  value={formData.donationTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="donationStatus">Request Status</Label>
            <Select
              value={formData.donationStatus}
              onValueChange={(value) =>
                handleSelectChange("donationStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {DONATION_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Message */}
          <div className="space-y-2">
            <Label htmlFor="additionalMessage">Additional Message</Label>
            <Textarea
              id="additionalMessage"
              name="additionalMessage"
              value={formData.additionalMessage}
              onChange={handleChange}
              placeholder="Any additional information..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {formData.additionalMessage.length}/500 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

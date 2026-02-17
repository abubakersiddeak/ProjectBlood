"use client";

import { DISTRICT_LIST, getGeoDetails } from "@/lib/geoLocationUtils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Calendar,
  Building2,
  User,
  Droplet,
  AlertCircle,
  Loader2,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { BLOOD_GROUPS, URGENCY_LEVELS } from "@/lib/constants";

// ===========================
// Types & Interfaces
// ===========================

interface AddDonationReqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  recipientName: string;
  bloodGroup: string;
  totalUnitsNeeded: number;
  hospitalName: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  donationDate: string;
  donationTime: string;
  recipientPhone: string;
  urgency: string;
  additionalMessage: string;
}

interface FormErrors {
  [key: string]: string;
}

// ===========================
// Constants
// ===========================

const INITIAL_FORM_DATA: FormData = {
  recipientName: "",
  bloodGroup: "",
  totalUnitsNeeded: 1,
  hospitalName: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  donationDate: "",
  donationTime: "",
  recipientPhone: "",
  urgency: "Normal",
  additionalMessage: "",
};

// ===========================
// Main Component
// ===========================

export default function AddDonationReqModal({
  isOpen,
  onClose,
  onSuccess,
}: AddDonationReqModalProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Form States
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [upazilaList, setUpazilaList] = useState<string[]>([]);
  const [selectedUpazila, setSelectedUpazila] = useState("");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ===========================
  // Handlers
  // ===========================

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedUpazila("");

    const { upazilas, coordinates } = getGeoDetails(district);

    setUpazilaList(upazilas);

    setFormData((prev) => ({
      ...prev,
      city: district,
      latitude: coordinates[1]?.toString() || "",
      longitude: coordinates[0]?.toString() || "",
    }));

    // Clear errors
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleUpazilaChange = (upazila: string) => {
    setSelectedUpazila(upazila);

    const { coordinates } = getGeoDetails(selectedDistrict, upazila);

    setFormData((prev) => ({
      ...prev,
      address: upazila,
      latitude: coordinates[1]?.toString() || "",
      longitude: coordinates[0]?.toString() || "",
    }));

    // Clear errors
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: "" }));
    }
  };

  // ===========================
  // Validation
  // ===========================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Patient name is required";
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = "Please select blood group";
    }

    if (formData.totalUnitsNeeded < 1) {
      newErrors.totalUnitsNeeded = "At least 1 unit required";
    }

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = "Hospital name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please select upazila";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please select district";
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Please select location";
    }

    if (!formData.donationDate) {
      newErrors.donationDate = "Please select date";
    } else {
      const selectedDate = new Date(formData.donationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.donationDate = "Cannot select past date";
      }
    }

    if (!formData.donationTime) {
      newErrors.donationTime = "Please select time";
    }

    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = "Phone number is required";
    } else if (
      !/^[0-9]{11}$/.test(formData.recipientPhone.replace(/[\s-]/g, ""))
    ) {
      newErrors.recipientPhone = "Enter valid phone number (11 digits)";
    }

    if (formData.additionalMessage.length > 500) {
      newErrors.additionalMessage = "Message can be maximum 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===========================
  // Input Handlers
  // ===========================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          setErrors((prev) => ({ ...prev, location: "" }));
        },
        () => {
          setErrors((prev) => ({
            ...prev,
            location: "Location not found. Enter manually.",
          }));
        },
      );
    }
  };

  // ===========================
  // Submit Handler
  // ===========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/login");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/bloodDonationReq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientName: formData.recipientName.trim(),
          bloodGroup: formData.bloodGroup,
          totalUnitsNeeded: formData.totalUnitsNeeded,
          hospitalName: formData.hospitalName.trim(),
          location: {
            type: "Point",
            coordinates: [
              parseFloat(formData.longitude),
              parseFloat(formData.latitude),
            ],
            address: formData.address.trim(),
            city: formData.city.trim(),
          },
          donationDate: formData.donationDate,
          donationTime: formData.donationTime,
          recipientPhone: formData.recipientPhone.trim(),
          urgency: formData.urgency,
          additionalMessage: formData.additionalMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create request");
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setFormData(INITIAL_FORM_DATA);
        setSelectedDistrict("");
        setSelectedUpazila("");
        setUpazilaList([]);
        setSubmitSuccess(false);
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message || "An error occurred");
      } else {
        setSubmitError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData(INITIAL_FORM_DATA);
      setSelectedDistrict("");
      setSelectedUpazila("");
      setUpazilaList([]);
      setErrors({});
      setSubmitError("");
      setSubmitSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b-4 border-red-600 bg-gray-50">
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center">
              <Droplet size={28} className="fill-current" />
            </div>
            <div>
              <div className="text-gray-900">Create Blood Donation Request</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                Add a new request
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Success Alert */}
          {submitSuccess && (
            <Alert className="border-2 border-green-500 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-900 font-bold">
                Success!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Blood donation request created successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b-2 border-red-600 pb-2">
              <User size={18} className="text-red-600" /> Patient Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName" className="text-sm font-bold">
                  Patient Name *
                </Label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  placeholder="Enter patient's full name"
                  className={
                    errors.recipientName ? "border-red-500 border-2" : ""
                  }
                />
                {errors.recipientName && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.recipientName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientPhone" className="text-sm font-bold">
                  Phone Number *
                </Label>
                <Input
                  id="recipientPhone"
                  name="recipientPhone"
                  type="tel"
                  value={formData.recipientPhone}
                  onChange={handleInputChange}
                  placeholder="01XXXXXXXXX"
                  className={
                    errors.recipientPhone ? "border-red-500 border-2" : ""
                  }
                />
                {errors.recipientPhone && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.recipientPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Blood & Units */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b-2 border-red-600 pb-2">
              <Droplet size={18} className="text-red-600" /> Blood Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="text-sm font-bold">
                  Blood Group *
                </Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) =>
                    handleSelectChange("bloodGroup", value)
                  }
                >
                  <SelectTrigger
                    className={
                      errors.bloodGroup ? "border-red-500 border-2" : ""
                    }
                  >
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodGroup && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.bloodGroup}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalUnitsNeeded" className="text-sm font-bold">
                  Number of Bags *
                </Label>
                <Input
                  id="totalUnitsNeeded"
                  name="totalUnitsNeeded"
                  type="number"
                  min="1"
                  value={formData.totalUnitsNeeded}
                  onChange={handleInputChange}
                  className={
                    errors.totalUnitsNeeded ? "border-red-500 border-2" : ""
                  }
                />
                {errors.totalUnitsNeeded && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.totalUnitsNeeded}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency" className="text-sm font-bold">
                  Urgency *
                </Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) =>
                    handleSelectChange("urgency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b-2 border-red-600 pb-2">
              <Building2 size={18} className="text-red-600" /> Hospital
              Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="hospitalName" className="text-sm font-bold">
                Hospital Name *
              </Label>
              <Input
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleInputChange}
                placeholder="Enter hospital name"
                className={errors.hospitalName ? "border-red-500 border-2" : ""}
              />
              {errors.hospitalName && (
                <p className="text-xs text-red-600 font-bold">
                  {errors.hospitalName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">District *</Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={handleDistrictChange}
                >
                  <SelectTrigger
                    className={errors.city ? "border-red-500 border-2" : ""}
                  >
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICT_LIST.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Upazila *</Label>
                <Select
                  value={selectedUpazila}
                  onValueChange={handleUpazilaChange}
                  disabled={!selectedDistrict || upazilaList.length === 0}
                >
                  <SelectTrigger
                    className={errors.address ? "border-red-500 border-2" : ""}
                  >
                    <SelectValue placeholder="Select upazila" />
                  </SelectTrigger>
                  <SelectContent>
                    {upazilaList.map((upazila) => (
                      <SelectItem key={upazila} value={upazila}>
                        {upazila}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.address && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Location Coordinates Display */}
            {formData.latitude && formData.longitude && (
              <div className="bg-green-50 border-2 border-green-200 p-3">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <MapPin size={16} className="text-green-600" />
                  <span className="font-bold">
                    Location saved: {formData.latitude.substring(0, 8)},{" "}
                    {formData.longitude.substring(0, 8)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2 border-b-2 border-red-600 pb-2">
              <Calendar size={18} className="text-red-600" /> Date & Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donationDate" className="text-sm font-bold">
                  Donation Date *
                </Label>
                <Input
                  id="donationDate"
                  name="donationDate"
                  type="date"
                  value={formData.donationDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={
                    errors.donationDate ? "border-red-500 border-2" : ""
                  }
                />
                {errors.donationDate && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.donationDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationTime" className="text-sm font-bold">
                  Preferred Time *
                </Label>
                <Input
                  id="donationTime"
                  name="donationTime"
                  type="time"
                  value={formData.donationTime}
                  onChange={handleInputChange}
                  className={
                    errors.donationTime ? "border-red-500 border-2" : ""
                  }
                />
                {errors.donationTime && (
                  <p className="text-xs text-red-600 font-bold">
                    {errors.donationTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="space-y-2">
            <Label htmlFor="additionalMessage" className="text-sm font-bold">
              Additional Information{" "}
              <span className="text-gray-500 font-normal text-xs">
                ({formData.additionalMessage.length}/500)
              </span>
            </Label>
            <Textarea
              id="additionalMessage"
              name="additionalMessage"
              value={formData.additionalMessage}
              onChange={handleInputChange}
              placeholder="Enter any other special information..."
              rows={4}
              className={
                errors.additionalMessage ? "border-red-500 border-2" : ""
              }
            />
            {errors.additionalMessage && (
              <p className="text-xs text-red-600 font-bold">
                {errors.additionalMessage}
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="pt-6 border-t-2 border-gray-200 gap-3 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="cursor-pointer w-full sm:w-auto border-2 hover:bg-gray-100 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer w-full sm:w-auto sm:min-w-[160px] font-bold shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Droplet className="mr-2 h-4 w-4 fill-current" />
                  Create Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

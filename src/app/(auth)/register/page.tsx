"use client";
import { signIn } from "next-auth/react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import { User, Mail, Phone, Droplets, MapPin, Lock, Heart } from "lucide-react";

import { IRegistrationFormData } from "@/types/registrationTyps";
import AvatarUpload from "@/components/shared/AvatarUpload";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import { DISTRICT_LIST, getGeoDetails } from "@/lib/geoLocationUtils";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<IRegistrationFormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bloodGroup: "",
      password: "",
      location: {
        address: { district: "", upazila: "" },
        coordinates: [],
      },
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDistrict = useWatch({
    control,
    name: "location.address.district",
    defaultValue: "",
  });

  const selectedUpazila = useWatch({
    control,
    name: "location.address.upazila",
    defaultValue: "",
  });

  const { upazilas, coordinates } = useMemo(
    () => getGeoDetails(selectedDistrict, selectedUpazila),
    [selectedDistrict, selectedUpazila],
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Please upload a valid image (JPG, PNG, GIF, WebP)");
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload a valid image",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("File size should be less than 5MB");
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "File size should be less than 5MB",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setAvatarFile(null);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit: SubmitHandler<IRegistrationFormData> = async (data) => {
    try {
      setLoading(true);

      if (!coordinates || coordinates.length !== 2) {
        Swal.fire({
          icon: "error",
          title: "Location Error",
          text: "Please select a valid district and upazila",
          confirmButtonColor: "#dc2626",
        });
        setLoading(false);
        return;
      }

      let avatarUrl: string | undefined = undefined;
      if (avatarFile) {
        try {
          Swal.fire({
            title: "Uploading Image...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const imageFormData = new FormData();
          imageFormData.append("image", avatarFile);

          const imgbbRes = await fetch("/api/imageUpload", {
            method: "POST",
            body: imageFormData, // Send as FormData, not JSON
          });

          const imgbbData = await imgbbRes.json();
          if (!imgbbData.success) throw new Error("Upload failed");

          avatarUrl = imgbbData.url; // Use the URL returned by your backend

          Swal.close();
        } catch (imageError) {
          console.error("Image upload error:", imageError);
          Swal.fire({
            icon: "error",
            title: "Upload Error",
            text: "Failed to upload image. Please try again.",
            confirmButtonColor: "#dc2626",
          });
          setLoading(false);
          return;
        }
      }

      Swal.fire({
        title: "Registering...",
        text: "Please wait while we create your account",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        password: data.password,
        district: data.location.address.district,
        upazila: data.location.address.upazila,
        location: {
          type: "Point" as const,
          coordinates: coordinates,
          address: {
            district: `${data.location.address.district}`,
            upazila: `${data.location.address.upazila}`,
          },

          city: data.location.address.district,
        },
        avatar:
          avatarUrl ||
          "https://i.ibb.co.com/20yB5J5L/vecteezy-man-empty-avatar-vector-photo-placeholder-for-social-36594092.webp",
      };

      // Api call
      const response = await fetch(`/api/registerUsar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // If server returns 400, 401, 500 etc.
        throw new Error(result.message || "Registration failed");
      }

      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        html: `
          <p class="text-gray-600">Welcome to our blood donation community!</p>
          <p class="text-sm text-gray-500 mt-2">You can now login with your credentials.</p>
        `,
        confirmButtonText: "Go to Home",
        confirmButtonColor: "#0B6623",
      });
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("SignIn response:", res);
      reset();
      handleRemoveImage();

      router.push("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <Navbar />
      {/* Mobile-friendly container with proper spacing */}
      <div className="container mx-auto mt-15 px-4 py-4 sm:py-5 md:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Card with responsive padding */}
          <div className="bg-white  shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden">
            {/* Header - More compact on mobile */}
            <div className="border-b border-gray-200 p-3 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 mb-3">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Donor Registration
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Join our community and help save lives
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-4 sm:p-4 md:p-5"
              noValidate
            >
              {/* Avatar Upload - Centered and prominent */}
              <div className="mb-6 ">
                <AvatarUpload
                  previewImage={previewImage}
                  onImageChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  error={avatarError}
                  fileInputRef={fileInputRef}
                />
              </div>

              {/* Section: Personal Information */}
              <div className="mb-2 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3">
                  <FormInput
                    id="fullName"
                    label="Full Name"
                    icon={User}
                    register={register}
                    error={errors.fullName}
                    placeholder="Enter your name"
                    validation={{
                      required: "Full name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters",
                      },
                    }}
                  />

                  <FormInput
                    id="email"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    register={register}
                    error={errors.email}
                    placeholder="Enter your email address"
                    validation={{
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email",
                      },
                    }}
                  />

                  <FormInput
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    icon={Phone}
                    register={register}
                    error={errors.phone}
                    placeholder="Enter your phone number"
                    validation={{
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{11}$/,
                        message: "Enter valid 11-digit number",
                      },
                    }}
                  />

                  <FormSelect
                    id="bloodGroup"
                    label="Blood Group"
                    options={BLOOD_GROUPS}
                    icon={Droplets}
                    register={register}
                    error={errors.bloodGroup}
                    placeholder="Select your blood group"
                    validation={{ required: "Blood group is required" }}
                  />
                </div>
              </div>

              {/* Section: Location Details */}
              <div className="mb-2 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  Location Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormSelect
                    id="location.address.district"
                    label="District"
                    options={DISTRICT_LIST}
                    icon={MapPin}
                    register={register}
                    error={errors.location?.address?.district}
                    placeholder="Select your district"
                    validation={{ required: "District is required" }}
                  />

                  <FormSelect
                    id="location.address.upazila"
                    label="Upazila/Thana"
                    options={upazilas}
                    icon={MapPin}
                    register={register}
                    error={errors.location?.address?.upazila}
                    placeholder={
                      selectedDistrict
                        ? "Select upazila"
                        : "Select district first"
                    }
                    validation={{ required: "Upazila is required" }}
                    disabled={!selectedDistrict || upazilas.length === 0}
                  />
                </div>

                {/* Location hint */}
                {selectedDistrict && selectedUpazila && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-800 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 shrink-0" />
                      <span>
                        Selected Location:{" "}
                        <strong>
                          {selectedUpazila}, {selectedDistrict}
                        </strong>
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Section: Security */}
              <div className="mb-2 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  Security
                </h2>
                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  icon={Lock}
                  register={register}
                  error={errors.password}
                  placeholder="Enter a strong password"
                  validation={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  showPasswordToggle
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
              </div>

              {/* Submit Button - Full width and prominent */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer
                  w-full bg-linear-to-r from-red-600 to-red-700 text-white 
                  py-3 sm:py-2.5 px-4 font-semibold 
                  hover:from-red-700 hover:to-red-800 
                  active:scale-[0.98]
                  transition-all duration-200
                  disabled:from-gray-400 disabled:to-gray-500 
                  disabled:cursor-not-allowed disabled:scale-100
                  flex items-center justify-center gap-2 
                  text-sm sm:text-base
                  shadow-lg hover:shadow-xl
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                "
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                      role="status"
                      aria-label="Loading"
                    />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>Register as Blood Donor</span>
                  </>
                )}
              </button>

              {/* Privacy notice */}
              <p className="mt-4 text-xs text-center text-gray-500 px-4">
                By registering, you agree to our{" "}
                <Link
                  href="/termsAndConditions"
                  className="text-red-600 hover:underline"
                >
                  Terms And Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacyPolicy"
                  className="text-red-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>

              {/* Login Link */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-red-600 font-semibold hover:text-red-700 hover:underline transition-colors"
                  >
                    Login here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

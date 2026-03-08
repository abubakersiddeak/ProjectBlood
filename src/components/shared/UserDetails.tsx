"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  IconArrowLeft,
  IconBan,
  IconCircleCheck,
  IconMapPin,
  IconPhone,
  IconTrash,
  IconUser,
  IconUserPlus,
  IconDroplet,
  IconShieldCheck,
  IconClock,
  IconCheck,
  IconX,
  IconUsers,
  IconHeart,
  IconFileText,
  IconMap,
  IconEdit,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

import { FIUser } from "@/types/frontendModelInterface";
import { BLOOD_GROUPS } from "@/lib/constants";
import { DISTRICT_LIST, getGeoDetails } from "@/lib/geoLocationUtils";
import { DangerZone } from "./DangerZone";

type UserRole = "admin" | "volunteer" | "user";
type UserStatus = "active" | "blocked" | "pending" | "inactive";

interface UserDetailsComponentProps {
  userId: string;
  showBackButton?: boolean;
  onUserUpdate?: (user: FIUser) => void;
  onUserDelete?: () => void;
}

export function UserDetailsComponent({
  userId,
  showBackButton = true,
  onUserUpdate,
  onUserDelete,
}: UserDetailsComponentProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [user, setUser] = useState<FIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    type: "status" | "role" | "delete";
    value?: UserStatus | UserRole;
  } | null>(null);

  // Location state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("");

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    bloodGroup: "",
    isAvailable: true,
    district: "",
    upazila: "",
  });

  // Get upazilas and coordinates based on selected location
  const { upazilas, coordinates } = useMemo(
    () => getGeoDetails(selectedDistrict, selectedUpazila),
    [selectedDistrict, selectedUpazila],
  );

  const currentUserRole = (session?.user?.role as UserRole) || "user";
  const isOwnProfile = session?.user?.id === userId;

  // Helper to get actual ID from MongoDB object
  const getActualId = (id: any): string => {
    if (typeof id === "string") return id;
    if (id?.$oid) return id.$oid;
    return "";
  };

  // Helper to get actual date from MongoDB date object
  const getActualDate = (date: any): string => {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (date?.$date) return date.$date;
    return "";
  };

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/getSingleUser`);
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUser(data);
        onUserUpdate?.(data);

        // Initialize edit form data
        const district = data.location?.address?.district || "";
        const upazila = data.location?.address?.upazila || "";

        setEditFormData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          bloodGroup: data.bloodGroup || "",
          isAvailable: data.isAvailable ?? true,
          district: district,
          upazila: upazila,
        });

        // Set location state
        setSelectedDistrict(district);
        setSelectedUpazila(upazila);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, onUserUpdate]);

  // Sync edit form data when dialog opens
  useEffect(() => {
    if (showEditDialog && user) {
      setSelectedDistrict(editFormData.district);
      setSelectedUpazila(editFormData.upazila);
    }
  }, [showEditDialog, user, editFormData.district, editFormData.upazila]);

  // Handle user info update
  const handleUpdateUserInfo = async () => {
    try {
      // Validation
      if (!selectedDistrict || !selectedUpazila) {
        toast.error("Please select both district and upazila");
        return;
      }

      if (!coordinates || coordinates.length !== 2) {
        toast.error(
          "Invalid location coordinates. Please reselect your location.",
        );
        return;
      }

      if (!editFormData.fullName.trim()) {
        toast.error("Please enter your full name");
        return;
      }

      if (!editFormData.phone.trim()) {
        toast.error("Please enter your phone number");
        return;
      }

      if (!editFormData.bloodGroup) {
        toast.error("Please select your blood group");
        return;
      }

      setIsUpdating(true);
      const actualId = getActualId(user?._id);

      const updatePayload = {
        fullName: editFormData.fullName.trim(),
        phone: editFormData.phone.trim(),
        bloodGroup: editFormData.bloodGroup,
        isAvailable: editFormData.isAvailable,
        district: selectedDistrict,
        upazila: selectedUpazila,
        location: {
          type: "Point" as const,
          coordinates: coordinates,
          address: {
            district: selectedDistrict,
            upazila: selectedUpazila,
          },
          city: selectedDistrict,
        },
      };

      const response = await fetch(`/api/users/${actualId}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      toast.success(data.message || "Profile updated successfully");

      // Update local state
      const updatedUser: FIUser = {
        ...user!,
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        bloodGroup: editFormData.bloodGroup,
        isAvailable: editFormData.isAvailable,
        location: {
          type: "Point" as const,
          coordinates: coordinates as [number, number],
          address: {
            district: selectedDistrict,
            upazila: selectedUpazila,
          },
          city: selectedDistrict,
        },
      };
      setUser(updatedUser);
      onUserUpdate?.(updatedUser);
      setShowEditDialog(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: UserStatus) => {
    try {
      setIsUpdating(true);
      const actualId = getActualId(user?._id);
      const response = await fetch(`/api/users/${actualId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`User status updated to ${newStatus}`);
      const updatedUser = { ...user!, status: newStatus };
      setUser(updatedUser);
      onUserUpdate?.(updatedUser);
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle role change
  const handleRoleChange = async (newRole: UserRole) => {
    try {
      setIsUpdating(true);
      const actualId = getActualId(user?._id);
      const response = await fetch(`/api/users/${actualId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success(`User role updated to ${newRole}`);
      const updatedUser = { ...user!, role: newRole };
      setUser(updatedUser);
      onUserUpdate?.(updatedUser);
      setShowRoleDialog(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      setIsUpdating(true);
      const actualId = getActualId(user?._id);
      const response = await fetch(`/api/users/${actualId}/deleteUser`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      onUserDelete?.();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsUpdating(false);
    }
  };

  // Permission checks
  const isTargetAdmin = user?.role === "admin";
  const canManageStatus =
    (currentUserRole === "admin" || currentUserRole === "volunteer") &&
    !isTargetAdmin;
  const canManageRole = currentUserRole === "admin" && !isTargetAdmin;
  const canDelete = currentUserRole === "admin" && !isTargetAdmin;

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: " text-green-700 ",
      pending: " text-yellow-700 ",
      blocked: " text-red-700 ",
      inactive: " text-gray-700 ",
    };
    return (
      colors[status?.toLowerCase()] ??
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: " text-blue-700 ",
      volunteer: " text-green-700 ",
      user: " text-gray-700 ",
    };
    return colors[role] ?? "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return <UserDetailsSkeleton showBackButton={showBackButton} />;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-500">User not found</p>
            {showBackButton && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-gray-100"
            >
              <IconArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {/* Edit Button - Only for own profile */}
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              disabled={isUpdating}
              className="border-blue-200 rounded-none cursor-pointer text-blue-600 hover:bg-blue-50"
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}

          {canManageStatus && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAction({
                  type: "status",
                  value: user.status === "active" ? "blocked" : "active",
                });
                setShowStatusDialog(true);
              }}
              disabled={isUpdating}
              className={
                user.status === "active"
                  ? "border-red-200 text-red-600 hover:bg-red-50"
                  : "border-green-200 text-green-600 hover:bg-green-50"
              }
            >
              {user.status === "active" ? (
                <>
                  <IconBan className="h-4 w-4 mr-2" />
                  Block User
                </>
              ) : (
                <>
                  <IconCircleCheck className="h-4 w-4 mr-2" />
                  Activate User
                </>
              )}
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isUpdating}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Left Column - Profile Card */}
        <div className="col-span-3 lg:col-span-1 space-y-2">
          <Card>
            <CardContent className="pt-2">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative">
                  <Image
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.fullName}
                    width={120}
                    height={120}
                    className="w-32 h-32 object-cover border-4 border-white shadow-lg"
                  />
                  <div
                    className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-white ${
                      user.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>

                {/* Name and Email */}
                <h2 className="mt-2 text-2xl font-bold text-gray-900 text-center">
                  {user.fullName}
                </h2>
                <p className="text-sm text-gray-500 break-all text-center px-2">
                  {user.email}
                </p>

                {/* Badges */}
                <div className="flex gap-2 mt-2 flex-wrap justify-center">
                  <span
                    className={`px-3 py-1 text-xs font-medium border ${getRoleColor(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-bold border uppercase ${getStatusColor(
                      user.status,
                    )}`}
                  >
                    {user.status}
                  </span>
                </div>

                {/* Blood Group Badge */}
                <div className="mt-2 flex items-center gap-2">
                  <IconDroplet className="h-5 w-5 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">
                    {user.bloodGroup}
                  </span>
                </div>

                {/* Availability Status */}
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    {user.isAvailable ? (
                      <>
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          Available to Donate
                        </span>
                      </>
                    ) : (
                      <>
                        <IconX className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          Not Available
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="w-full mt-2 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.followerCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.following?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Following</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.blogCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">Blogs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.donationHistory?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Donations</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="w-full mt-2 pt-2 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IconPhone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-900">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconMapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-900">
                      {user.location?.address?.upazila &&
                      user.location?.address?.district
                        ? `${user.location.address.upazila}, ${user.location.address.district}`
                        : user.location?.address?.district || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconUser className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-gray-900 font-mono">
                      ID: {user.userId}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Management Card */}
          {canManageRole && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Role Management</CardTitle>
                <CardDescription>Change user role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {user.role !== "admin" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedAction({ type: "role", value: "admin" });
                      setShowRoleDialog(true);
                    }}
                    disabled={isUpdating}
                  >
                    <IconShieldCheck className="h-4 w-4 mr-2" />
                    Make Admin
                  </Button>
                )}
                {user.role !== "volunteer" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedAction({ type: "role", value: "volunteer" });
                      setShowRoleDialog(true);
                    }}
                    disabled={isUpdating}
                  >
                    <IconUserPlus className="h-4 w-4 mr-2" />
                    Make Volunteer
                  </Button>
                )}
                {user.role !== "user" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedAction({ type: "role", value: "user" });
                      setShowRoleDialog(true);
                    }}
                    disabled={isUpdating}
                  >
                    <IconUser className="h-4 w-4 mr-2" />
                    Make Regular User
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 col-span-3 space-y-2">
          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconMapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>Address and location details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="District"
                  value={user.location?.address?.district || "Not provided"}
                  icon={<IconMapPin className="h-4 w-4 text-gray-400" />}
                />
                <InfoField
                  label="Upazila"
                  value={user.location?.address?.upazila || "Not provided"}
                  icon={<IconMapPin className="h-4 w-4 text-gray-400" />}
                />
                {user.location?.coordinates && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">
                        Coordinates (Lng, Lat)
                      </label>
                      <div className="flex items-center gap-2">
                        <IconMap className="h-4 w-4 text-gray-400" />
                        <p className="text-base text-gray-900 font-mono">
                          {user.location.coordinates[0].toFixed(4)},{" "}
                          {user.location.coordinates[1].toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-500">
                        Location Type
                      </label>
                      <p className="text-base text-gray-900">
                        {user.location.type || "Point"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconShieldCheck className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Account status and timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Account Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold  uppercase ${getStatusColor(
                      user.status,
                    )}`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium  ${getRoleColor(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <InfoField
                  label="Created At"
                  value={new Date(
                    getActualDate(user.createdAt),
                  ).toLocaleString()}
                  icon={<IconClock className="h-4 w-4 text-gray-400" />}
                />
                <InfoField
                  label="Last Updated"
                  value={new Date(
                    getActualDate(user.updatedAt),
                  ).toLocaleString()}
                  icon={<IconClock className="h-4 w-4 text-gray-400" />}
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">
                    Available to Donate
                  </label>
                  <div className="flex items-center gap-2">
                    {user.isAvailable ? (
                      <>
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <span className="text-base text-green-600 font-medium">
                          Yes
                        </span>
                      </>
                    ) : (
                      <>
                        <IconX className="h-4 w-4 text-red-600" />
                        <span className="text-base text-red-600 font-medium">
                          No
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className=" col-span-3">
          {" "}
          {/* Danger Zone - Only visible for own profile or admin */}
          {(isOwnProfile || canDelete) && (
            <DangerZone
              userId={getActualId(user._id)}
              userEmail={user.email}
              userName={user.fullName}
              isOwnProfile={isOwnProfile}
              isAdmin={currentUserRole === "admin"}
              onAccountDeleted={() => {
                if (!isOwnProfile) {
                  onUserDelete?.();
                  router.push("/dashboard/users");
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden rounded-none p-0">
          {/* Header with gradient background */}
          <div className="relative bg-linear-to-r from-blue-600 to-blue-400 px-6 py-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <IconEdit className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-white">
                    Edit Profile
                  </DialogTitle>
                </div>
                <DialogDescription className="text-white/90 text-sm sm:text-base">
                  Update your personal information and keep your profile current
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-280px)] px-6 py-6 hide-scrollbar">
            <div className="space-y-8">
              {/* Personal Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-lg">
                    <IconUser className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Personal Details
                  </h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      Full Name
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        value={editFormData.fullName}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                        className="pl-10 h-11 border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      Phone Number
                      <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+880 1234-567890"
                        className="pl-10 h-11 border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-red-100 dark:bg-red-950 p-2 rounded-lg">
                    <IconDroplet className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Blood Information
                  </h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bloodGroup"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      Blood Group
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={editFormData.bloodGroup}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          bloodGroup: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500">
                        <div className="flex items-center gap-2">
                          <IconDroplet className="h-4 w-4 text-red-600" />
                          <SelectValue placeholder="Select blood group" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <div className="grid grid-cols-4 gap-2 p-2">
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem
                              key={group}
                              value={group}
                              className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <div className="flex items-center gap-2 font-bold text-red-600">
                                <IconDroplet className="h-3 w-3" />
                                {group}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="isAvailable"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Donation Availability
                    </Label>
                    <Select
                      value={editFormData.isAvailable ? "yes" : "no"}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          isAvailable: value === "yes",
                        }))
                      }
                    >
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-medium text-green-700 dark:text-green-400">
                              Available to Donate
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="no" className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="font-medium text-red-700 dark:text-red-400">
                              Not Available
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Availability Info Card */}
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    editFormData.isAvailable
                      ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                      : "bg-red-50 dark:bg-red-950/20 border-red-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {editFormData.isAvailable ? (
                      <IconCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <IconX className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          editFormData.isAvailable
                            ? "text-green-800 dark:text-green-300"
                            : "text-red-800 dark:text-red-300"
                        }`}
                      >
                        {editFormData.isAvailable
                          ? "You are available to donate blood"
                          : "You are currently not available"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          editFormData.isAvailable
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 dark:text-red-400"
                        }`}
                      >
                        {editFormData.isAvailable
                          ? "Your profile will be visible to those seeking blood donors"
                          : "Your profile will not appear in donor searches"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-green-100 dark:bg-green-950 p-2 rounded-lg">
                    <IconMapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Location Details
                  </h3>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* District Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="district"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      District
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={selectedDistrict}
                      onValueChange={(value) => {
                        setSelectedDistrict(value);
                        setSelectedUpazila(""); // Reset upazila when district changes
                        setEditFormData((prev) => ({
                          ...prev,
                          district: value,
                          upazila: "",
                        }));
                      }}
                    >
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500">
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-green-600" />
                          <SelectValue placeholder="Select your district" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {DISTRICT_LIST.map((district) => (
                          <SelectItem
                            key={district}
                            value={district}
                            className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upazila Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="upazila"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      Upazila / Area
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={selectedUpazila}
                      onValueChange={(value) => {
                        setSelectedUpazila(value);
                        setEditFormData((prev) => ({
                          ...prev,
                          upazila: value,
                        }));
                      }}
                      disabled={!selectedDistrict || upazilas.length === 0}
                    >
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-700 focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-green-600" />
                          <SelectValue
                            placeholder={
                              selectedDistrict
                                ? "Select your upazila"
                                : "Select district first"
                            }
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {upazilas.map((upazila) => (
                          <SelectItem
                            key={upazila}
                            value={upazila}
                            className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            {upazila}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location Preview */}
                {selectedDistrict && selectedUpazila && (
                  <div className="mt-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <IconMapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                          Selected Location
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          <strong>
                            {selectedUpazila}, {selectedDistrict}
                          </strong>
                        </p>
                        {coordinates && coordinates.length === 2 && (
                          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                            Coordinates: {coordinates[1].toFixed(4)},{" "}
                            {coordinates[0].toFixed(4)}
                          </p>
                        )}
                      </div>
                      <IconCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                )}

                {/* Warning when no district selected */}
                {!selectedDistrict && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <IconMapPin className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        Please select your district to continue
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <DialogFooter className="gap-3 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isUpdating}
                className="cursor-pointer rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-1 sm:flex-none"
              >
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateUserInfo}
                disabled={isUpdating}
                className="cursor-pointer rounded-none bg-linear-to-r from-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Dialogs */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        userName={user.fullName}
        onConfirm={handleDeleteUser}
        isUpdating={isUpdating}
      />

      <StatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        userName={user.fullName}
        currentStatus={user.status}
        newStatus={selectedAction?.value as UserStatus}
        onConfirm={() =>
          handleStatusChange(selectedAction?.value as UserStatus)
        }
        isUpdating={isUpdating}
      />

      <RoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        userName={user.fullName}
        currentRole={user.role}
        newRole={selectedAction?.value as UserRole}
        onConfirm={() => handleRoleChange(selectedAction?.value as UserRole)}
        isUpdating={isUpdating}
      />
    </div>
  );
}

// Helper Components
function InfoField({
  label,
  value,
  icon,
  mono = false,
  valueClassName = "",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="flex items-center gap-2">
        {icon}
        <p
          className={`text-base text-gray-900 ${mono ? "font-mono" : ""} ${valueClassName}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function DeleteDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  isUpdating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: () => void;
  isUpdating: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account for <strong>{userName}</strong> and remove all their data
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUpdating}
            className="bg-red-600 hover:bg-red-700"
          >
            {isUpdating ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StatusDialog({
  open,
  onOpenChange,
  userName,
  currentStatus,
  newStatus,
  onConfirm,
  isUpdating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentStatus: string;
  newStatus?: UserStatus;
  onConfirm: () => void;
  isUpdating: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Status</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to{" "}
            {newStatus === "blocked" ? "block" : "activate"}{" "}
            <strong>{userName}</strong>?
            {newStatus === "blocked" &&
              " The user will not be able to access their account."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUpdating}
            className={
              newStatus === "blocked"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {isUpdating
              ? "Updating..."
              : newStatus === "blocked"
                ? "Block User"
                : "Activate User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RoleDialog({
  open,
  onOpenChange,
  userName,
  currentRole,
  newRole,
  onConfirm,
  isUpdating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentRole: string;
  newRole?: UserRole;
  onConfirm: () => void;
  isUpdating: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to change <strong>{userName}</strong>'s role
            from <strong>{currentRole}</strong> to <strong>{newRole}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Change Role"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UserDetailsSkeleton({ showBackButton }: { showBackButton: boolean }) {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        {showBackButton && <Skeleton className="h-10 w-10" />}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="w-32 h-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

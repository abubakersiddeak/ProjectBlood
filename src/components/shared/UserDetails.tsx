"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

import { FIUser } from "@/types/frontendModelInterface";

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
  const [selectedAction, setSelectedAction] = useState<{
    type: "status" | "role" | "delete";
    value?: UserStatus | UserRole;
  } | null>(null);

  const currentUserRole = (session?.user?.role as UserRole) || "user";

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
          {/* <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.fullName.toLocaleUpperCase()} Details
            </h1>
            <p className="text-sm text-gray-500">
              View and manage user information
            </p>
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
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
        <div className="lg:col-span-1 space-y-2">
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
                      {user.location?.address?.district || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IconUser className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
        <div className="lg:col-span-2 space-y-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic details about the user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Full Name" value={user.fullName} />
                <InfoField
                  label="User ID"
                  value={user.userId.toString()}
                  mono
                />
                <InfoField label="Email Address" value={user.email} />
                <InfoField label="Phone Number" value={user?.phone ?? ""} />
                <InfoField
                  label="Blood Group"
                  value={user.bloodGroup}
                  valueClassName="font-bold text-red-600"
                  icon={<IconDroplet className="h-4 w-4 text-red-600" />}
                />
                <InfoField
                  label="Availability Status"
                  value={user.isAvailable ? "Available" : "Not Available"}
                  valueClassName={
                    user.isAvailable ? "text-green-600" : "text-red-600"
                  }
                />
              </div>
            </CardContent>
          </Card>

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
                          {user.location.coordinates[0]},{" "}
                          {user.location.coordinates[1]}
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

          {/* Social Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Social Information
              </CardTitle>
              <CardDescription>Community engagement details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Followers"
                  value={user.followerCount?.toString() || "0"}
                  icon={<IconHeart className="h-4 w-4 text-gray-400" />}
                />
                <InfoField
                  label="Following"
                  value={user.following?.length?.toString() || "0"}
                  icon={<IconUsers className="h-4 w-4 text-gray-400" />}
                />
                <InfoField
                  label="Blog Posts"
                  value={user.blogCount?.toString() || "0"}
                  icon={<IconFileText className="h-4 w-4 text-gray-400" />}
                />
                <InfoField
                  label="Donations Made"
                  value={user.donationHistory?.length?.toString() || "0"}
                  icon={<IconDroplet className="h-4 w-4 text-gray-400" />}
                />
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
      </div>

      {/* Dialogs */}
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

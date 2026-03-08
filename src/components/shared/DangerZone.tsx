"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconTrash,
  IconLock,
  IconMail,
  IconEye,
  IconEyeOff,
  IconShield,
} from "@tabler/icons-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DangerZoneProps {
  userId: string;
  userEmail: string;
  userName: string;
  isOwnProfile: boolean;
  isAdmin: boolean;
  onAccountDeleted?: () => void;
}

export function DangerZone({
  userId,
  userEmail,
  userName,
  isOwnProfile,
  isAdmin,
  onAccountDeleted,
}: DangerZoneProps) {
  const router = useRouter();

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/users/${userId}/deleteUser`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      setShowDeleteDialog(false);

      // If user deleted their own account, sign out
      if (isOwnProfile) {
        await signOut({ redirect: false });
        router.push("/");
      } else {
        onAccountDeleted?.();
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const response = await fetch(`/api/users/${userId}/changePassword`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Sign out after password change for security
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push("/login");
        toast.info("Please login with your new password");
      }, 1500);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle email change
  const handleChangeEmail = async () => {
    // Validation
    if (!emailData.newEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    if (!emailData.password) {
      toast.error("Please enter your password to confirm");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailData.newEmail.toLowerCase() === userEmail.toLowerCase()) {
      toast.error("New email must be different from current email");
      return;
    }

    try {
      setIsUpdatingEmail(true);
      const response = await fetch(`/api/users/${userId}/changeEmail`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          password: emailData.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change email");
      }

      toast.success("Email changed successfully");
      setShowEmailDialog(false);
      setEmailData({ newEmail: "", password: "" });

      // Sign out after email change for security
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push("/login");
        toast.info("Please login with your new email");
      }, 1500);
    } catch (error: any) {
      console.error("Error changing email:", error);
      toast.error(error.message || "Failed to change email");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Only show if it's own profile or admin viewing another user
  if (!isOwnProfile && !isAdmin) {
    return null;
  }

  return (
    <>
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-950 p-2 rounded-lg">
              <IconAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-900 dark:text-red-100">
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Irreversible and destructive actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Change Password - Only for own profile */}
          {isOwnProfile && (
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-between p-4 border border-red-200 dark:border-red-800  bg-white dark:bg-gray-900">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <IconLock className="h-4 w-4 text-red-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your password to keep your account secure
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="border-red-300 cursor-pointer rounded-none text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
              >
                <IconLock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          )}

          {/* Change Email - Only for own profile */}
          {isOwnProfile && (
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-between p-4 border border-red-200 dark:border-red-800  bg-white dark:bg-gray-900">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <IconMail className="h-4 w-4 text-red-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Change Email Address
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your email address for account recovery
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Current: <span className="font-medium">{userEmail}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(true)}
                className="border-red-300 cursor-pointer rounded-none text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
              >
                <IconMail className="h-4 w-4 mr-2" />
                Change Email
              </Button>
            </div>
          )}

          {/* Delete Account */}
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between p-4 border border-red-300 dark:border-red-700  bg-red-50 dark:bg-red-950/30">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <IconTrash className="h-4 w-4 text-red-600" />
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Delete {isOwnProfile ? "Your" : "This"} Account
                </h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                {isOwnProfile
                  ? "Permanently delete your account and all associated data"
                  : `Permanently delete ${userName}'s account and all associated data`}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                ⚠️ This action cannot be undone
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red-600 cursor-pointer hover:bg-red-700 rounded-none"
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2  text-red-600">
              <IconAlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {" "}
                <div>
                  This will permanently delete{" "}
                  {isOwnProfile ? "your" : `${userName}'s`} account and remove
                  all data including:
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Profile information</li>
                  <li>Donation history</li>
                  <li>Blog posts and comments</li>
                  <li>Followers and following</li>
                  <li>All personal data</li>
                </ul>
                <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                    To confirm, type <span className="font-mono">DELETE</span>{" "}
                    below:
                  </p>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="border-red-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeleteConfirmation("")}
              className="cursor-pointer rounded-none"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={
                isDeleting || deleteConfirmation.toLowerCase() !== "delete"
              }
              className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-none"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconLock className="h-5 w-5 text-blue-600" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Current Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password (min 6 characters)"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm New Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100 font-semibold mb-1">
                Password Requirements:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li className="flex items-center gap-1">
                  <span
                    className={
                      passwordData.newPassword.length >= 6
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • At least 6 characters
                  </span>
                </li>
                <li className="flex items-center gap-1">
                  <span
                    className={
                      passwordData.newPassword ===
                        passwordData.confirmPassword && passwordData.newPassword
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • Passwords match
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              disabled={isUpdatingPassword}
              className="cursor-pointer rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={isUpdatingPassword}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer rounded-none"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <IconLock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconMail className="h-5 w-5 text-blue-600" />
              Change Email Address
            </DialogTitle>
            <DialogDescription>
              Update your email address for account access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Email */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border">
              <Label className="text-xs text-gray-600 dark:text-gray-400">
                Current Email
              </Label>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {userEmail}
              </p>
            </div>

            {/* New Email */}
            <div className="space-y-2">
              <Label htmlFor="newEmail">
                New Email Address <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newEmail"
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  placeholder="Enter new email address"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="emailPassword">
                Confirm Password <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="emailPassword"
                  type={showEmailPassword ? "text" : "password"}
                  value={emailData.password}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter your password to confirm"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showEmailPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-900 dark:text-amber-100">
                <strong>⚠️ Important:</strong> After changing your email, you'll
                be logged out and need to login with your new email address.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEmailDialog(false);
                setEmailData({ newEmail: "", password: "" });
              }}
              disabled={isUpdatingEmail}
              className="cursor-pointer rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangeEmail}
              disabled={isUpdatingEmail}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer rounded-none"
            >
              {isUpdatingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <IconMail className="mr-2 h-4 w-4" />
                  Change Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

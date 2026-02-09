import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete users
    const userRole = session.user.role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete users" },
        { status: 403 },
      );
    }

    const { userId } = await params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();

    // Find the target user
    const targetUser = await UserModel.findById(userId);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting admin users
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 403 },
      );
    }

    // Prevent users from deleting themselves
    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 },
      );
    }

    // Store user info for response
    const deletedUserInfo = {
      _id: targetUser._id,
      fullName: targetUser.fullName,
      email: targetUser.email,
      role: targetUser.role,
    };

    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    // Optional: Log deletion
    console.log(
      `User deleted by ${session.user.email}: ${deletedUserInfo.email} (${deletedUserInfo.role})`,
    );

    // Optional: Clean up related data
    // You might want to delete or anonymize related records
    // such as donations, requests, etc.
    // await Donation.deleteMany({ userId: userId });
    // await BloodRequest.deleteMany({ userId: userId });

    return NextResponse.json(
      {
        message: "User deleted successfully",
        deletedUser: deletedUserInfo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Optional: GET endpoint to fetch single user details

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import { auth } from "@/auth";

type UserStatus = "active" | "blocked" | "pending" | "inactive";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (admin or volunteer)
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "volunteer") {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 },
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses: UserStatus[] = [
      "active",
      "blocked",
      "pending",
      "inactive",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

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

    // Prevent modifying admin users (only admins can be modified by other admins)
    if (targetUser.role === "admin" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Cannot modify admin users" },
        { status: 403 },
      );
    }

    // Prevent users from modifying themselves
    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own status" },
        { status: 403 },
      );
    }

    // Update user status
    targetUser.status = status;
    await targetUser.save();

    return NextResponse.json(
      {
        message: "User status updated successfully",
        user: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email,
          status: targetUser.status,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

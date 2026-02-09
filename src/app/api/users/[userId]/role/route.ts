import { NextRequest, NextResponse } from "next/server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import { auth } from "@/auth";

type UserRole = "admin" | "volunteer" | "user";

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

    // Only admins can change roles
    const userRole = session.user.role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can change user roles" },
        { status: 403 },
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles: UserRole[] = ["admin", "volunteer", "user"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role value" },
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

    // Prevent admins from modifying other admin roles
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot modify admin user roles" },
        { status: 403 },
      );
    }

    // Prevent users from modifying themselves
    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own role" },
        { status: 403 },
      );
    }

    // Store old role for logging
    const oldRole = targetUser.role;

    // Update user role
    targetUser.role = role;
    await targetUser.save();

    // Optional: Log role change
    console.log(
      `Role changed by ${session.user.email}: User ${targetUser.email} from ${oldRole} to ${role}`,
    );

    return NextResponse.json(
      {
        message: "User role updated successfully",
        user: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email,
          role: targetUser.role,
          previousRole: oldRole,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

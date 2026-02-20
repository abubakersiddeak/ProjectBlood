import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
): Promise<Response> {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete users" },
        { status: 403 },
      );
    }

    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await dbConnect();

    const targetUser = await UserModel.findById(userId);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 403 },
      );
    }

    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 },
      );
    }

    const deletedUserInfo = {
      _id: targetUser._id,
      fullName: targetUser.fullName,
      email: targetUser.email,
      role: targetUser.role,
    };

    await UserModel.findByIdAndDelete(userId);

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

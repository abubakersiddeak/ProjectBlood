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

    const { userId } = await context.params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = await UserModel.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isOwner = session.user.id === userId;
    const isAdmin = currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUser = await UserModel.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

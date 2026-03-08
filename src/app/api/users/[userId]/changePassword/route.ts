import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";

export async function PATCH(
  req: NextRequest,

  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password as string,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // পাসওয়ার্ড আপডেট করুন
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

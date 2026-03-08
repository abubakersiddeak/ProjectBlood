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

    const { newEmail, password } = await req.json();

    if (!newEmail || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password is incorrect" },
        { status: 401 },
      );
    }

    const existingUser = await UserModel.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 409 },
      );
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    return NextResponse.json(
      { message: "Email changed successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error changing email:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

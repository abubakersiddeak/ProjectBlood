// app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import { hashToken } from "@/lib/tokenUtils";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token is required", valid: false },
        { status: 400 },
      );
    }

    await dbConnect();

    // Hash the token to compare with database
    const hashedToken = hashToken(token);

    // Find user with valid token
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("email fullName");

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid or expired reset token",
          valid: false,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Token is valid",
        valid: true,
        email: user.email,
        userName: user.fullName,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      {
        message: "An error occurred",
        valid: false,
      },
      { status: 500 },
    );
  }
}

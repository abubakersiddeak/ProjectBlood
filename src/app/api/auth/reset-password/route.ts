// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import { hashToken } from "@/lib/tokenUtils";
import { sendEmail, getPasswordResetSuccessTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
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
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: getPasswordResetSuccessTemplate(user.fullName),
    });

    return NextResponse.json(
      {
        message:
          "Password reset successful. You can now log in with your new password.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 },
    );
  }
}

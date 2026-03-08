// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import { generateResetToken, hashToken } from "@/lib/tokenUtils";
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Find user by email
    const user = await UserModel.findOne({
      email: email.toLowerCase(),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a password reset link has been sent.",
        },
        { status: 200 },
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Save hashed token and expiry to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send email
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: getPasswordResetEmailTemplate(user.fullName, resetUrl),
    });

    if (!emailResult.success) {
      // Rollback token save
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return NextResponse.json(
        { message: "Failed to send email. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, a password reset link has been sent.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}

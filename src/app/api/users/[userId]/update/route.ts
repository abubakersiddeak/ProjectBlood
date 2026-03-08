import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import { auth } from "@/auth";
import { Types } from "mongoose";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> },
) {
  try {
    const params = await props.params;
    const { userId } = params;

    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 },
      );
    }

    // Check if user is updating their own profile
    if (session.user.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own profile",
        },
        { status: 403 },
      );
    }

    await dbConnect();

    const body = await req.json();
    const { fullName, phone, bloodGroup, isAvailable, location } = body;

    // Validation
    if (!fullName || !phone || !bloodGroup) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone, and blood group are required",
        },
        { status: 400 },
      );
    }

    // Find and update user
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Update fields
    user.fullName = fullName;
    user.phone = phone;
    user.bloodGroup = bloodGroup;
    user.isAvailable = isAvailable ?? user.isAvailable;

    if (location) {
      user.location = {
        type: "Point",
        coordinates: location.coordinates ||
          user.location?.coordinates || [0, 0],
        address: {
          district:
            location.address?.district || user.location?.address?.district,
          upazila: location.address?.upazila || user.location?.address?.upazila,
        },
      };
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: user,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

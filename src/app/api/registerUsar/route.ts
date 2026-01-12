import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      fullName,
      email,
      password,
      avatar,
      bloodGroup,
      location, // Should contain { address, city, coordinates: [lng, lat] }
      phone,
    } = body;

    // 1. Validation
    if (!email || !password || !fullName || !bloodGroup || !location) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already registered with this email" },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create User based on UserModel
    const newUser = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      avatar,
      bloodGroup,
      role: "user",
      status: "active",
      isAvailable: true,
      location: {
        type: "Point",
        coordinates: location.coordinates, // [longitude, latitude]
        address: location.address,
        city: location.city,
      },
      phone,
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}

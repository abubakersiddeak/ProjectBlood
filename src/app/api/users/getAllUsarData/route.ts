// app/api/users/route.ts
import { NextResponse } from "next/server";

import UserModel from "@/models/UserModel";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    // ১. ডাটাবেস কানেক্ট করা
    await dbConnect();

    // ২. ইউজার ডাটা নিয়ে আসা (পাসওয়ার্ড ছাড়া)
    // .lean() ব্যবহার করলে কুয়েরি ফাস্ট হয়
    const users = await UserModel.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    // ৩. রেসপন্স পাঠানো
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

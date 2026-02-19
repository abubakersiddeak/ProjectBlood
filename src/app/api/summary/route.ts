import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";

export async function GET() {
  try {
    await dbConnect();

    // 1️⃣ Total users
    const totalUsers = await UserModel.countDocuments();
    const totalAdmins = await UserModel.countDocuments({
      role: "admin",
    });
    const totalVolunteer = await UserModel.countDocuments({
      role: "volunteer",
    });
    // 2️⃣ Blood donation requests counts by status
    const statuses = ["pending", "in-progress", "complite"]; // adjust your DB status
    const requestsCount: Record<string, number> = {};

    await Promise.all(
      statuses.map(async (status) => {
        requestsCount[status] = await BloodDonationReqModel.countDocuments({
          donationStatus: status,
        });
      }),
    );
    const summary = {
      totalUsers,
      totalAdmins,
      totalVolunteer,
      totalPending: requestsCount["pending"] || 0,
      totalInProgress: requestsCount["in-progress"] || 0,
      totalComplite: requestsCount["complite"] || 0,
    };
    console.log(summary);
    // 3️⃣ Return JSON
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch dashboard summary",
        data: {},
      },
      { status: 500 },
    );
  }
}

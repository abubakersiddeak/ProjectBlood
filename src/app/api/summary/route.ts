import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import { auth } from "@/auth";
import mongoose from "mongoose";
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  const role = session?.user.role || "user";
  const userId = session?.user.id;
  if (role === "user") {
    try {
      await dbConnect();
      const user = await UserModel.findById(userId);

      const ownCreateBloodReq = await BloodDonationReqModel.aggregate([
        {
          $match: {
            requesterId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: "$donationStatus",
            count: { $sum: 1 },
          },
        },
      ]);
      const summary = {
        ownCreateBloodReq,
        ownTotalDonation: user?.donationHistory.length,
      };
      return NextResponse.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error("My requests fetch error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message || "Failed to fetch requests",
        },
        { status: 500 },
      );
    }
  } else {
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
      const statuses = ["pending", "in-progress", "success", "cancel"];
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
        totalSuccess: requestsCount["success"] || 0,
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
}

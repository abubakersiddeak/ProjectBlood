import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import mongoose from "mongoose";
import { IBloodDonationRequest } from "@/types/modelTyps";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "12")),
    );
    const bloodGroup = searchParams.get("bloodGroup");
    const district = searchParams.get("district");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "pending";

    const query: mongoose.FilterQuery<IBloodDonationRequest> = {
      donationStatus: status,
    };

    if (bloodGroup && bloodGroup !== "all" && bloodGroup !== "All") {
      query.bloodGroup = bloodGroup;
    }

    if (district && district.trim()) {
      query.$or = [
        { "location.city": { $regex: district.trim(), $options: "i" } },
        { "location.address": { $regex: district.trim(), $options: "i" } },
      ];
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { recipientName: searchRegex },
        { hospitalName: searchRegex },
        { additionalMessage: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      BloodDonationReqModel.find(query)
        .populate("requesterId", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BloodDonationReqModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}

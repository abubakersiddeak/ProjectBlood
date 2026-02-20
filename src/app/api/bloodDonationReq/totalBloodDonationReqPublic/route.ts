import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "12")),
    );
    const skip = (page - 1) * limit;

    // Filters
    const bloodGroup = searchParams.get("bloodGroup");
    const district = searchParams.get("district");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "pending";

    // Base Query
    const query: any = {
      donationStatus: status,
    };

    if (bloodGroup && bloodGroup !== "all" && bloodGroup !== "All") {
      query.bloodGroup = bloodGroup;
    }

    // Merge OR conditions safely
    const orConditions: any[] = [];

    if (district && district.trim()) {
      const regex = { $regex: district.trim(), $options: "i" };
      orConditions.push(
        { "location.city": regex },
        { "location.address": regex },
      );
    }

    if (search && search.trim()) {
      const regex = { $regex: search.trim(), $options: "i" };
      orConditions.push(
        { recipientName: regex },
        { hospitalName: regex },
        { additionalMessage: regex },
      );
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    // Execute queries in parallel
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

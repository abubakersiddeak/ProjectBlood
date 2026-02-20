import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/db";

import { auth } from "@/auth";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login." },
        { status: 401 },
      );
    }

    await connectDB();

    // Parse and validate request body
    const body = await req.json();
    console.log(body);
    // Validate date is not in the past
    const donationDate = new Date(body.donationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (donationDate < today) {
      return NextResponse.json(
        { success: false, message: "Donation date cannot be in the past" },
        { status: 400 },
      );
    }

    // Create new blood donation request
    const newRequest = await BloodDonationReqModel.create({
      requesterId: session.user.id,
      recipientName: body.recipientName,
      bloodGroup: body.bloodGroup,
      totalUnitsNeeded: body.totalUnitsNeeded,
      hospitalName: body.hospitalName,
      location: body.location,
      donationDate: body.donationDate,
      donationTime: body.donationTime,
      recipientPhone: body.recipientPhone,
      urgency: body.urgency,
      additionalMessage: body.additionalMessage,
      donationStatus: "pending",
      unitsFulfilled: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blood donation request created successfully",
        data: newRequest,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating blood donation request:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create blood donation request",
      },
      { status: 500 },
    );
  }
}

// ===========================
// GET - Fetch All Requests (with filters)
// ===========================

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const bloodGroup = searchParams.get("bloodGroup");
    const search = searchParams.get("search");

    // Build query
    const query: any = {};

    // Role-based filtering
    if (session.user.role === "user") {
      query.requesterId = session.user.id;
    }

    if (status && status !== "all") {
      query.donationStatus = status;
    }

    if (bloodGroup && bloodGroup !== "all") {
      query.bloodGroup = bloodGroup;
    }

    if (search) {
      query.$or = [
        { recipientName: { $regex: search, $options: "i" } },
        { hospitalName: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    // Execute query
    const [requests, total] = await Promise.all([
      BloodDonationReqModel.find(query)
        .populate("requesterId", "name email phone avatar")
        .populate("donorId", "name email phone avatar")
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
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    console.error("Error fetching blood donation requests:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch requests",
      },
      { status: 500 },
    );
  }
}

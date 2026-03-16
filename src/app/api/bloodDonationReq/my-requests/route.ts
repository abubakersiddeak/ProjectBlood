import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const session = await auth();
    console.log(session);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    console.log(searchParams);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "12")),
    );
    const skip = (page - 1) * limit;

    // Filter by status (optional)
    const status = searchParams.get("status");

    // Query for user's own requests
    const query: any = {
      requesterId: session.user.id, // Only get requests created by this user
    };

    if (status && status !== "all") {
      query.donationStatus = status;
    }

    // Execute queries
    const [requests, total] = await Promise.all([
      BloodDonationReqModel.find(query)
        .populate("requesterId", "fullName avatar")
        .populate({
          path: "potentialDonors.donorId",
          select: "fullName avatar phone bloodGroup ",
          transform: (doc) => {
            if (doc) {
              // Convert the doc to a plain object and add the count
              const obj = doc.toObject ? doc.toObject() : doc;
              obj.donationCount = obj.donationHistory
                ? obj.donationHistory.length
                : 0;
              return obj;
            }
            return doc;
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BloodDonationReqModel.countDocuments(query),
    ]);
    console.log(requests);
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

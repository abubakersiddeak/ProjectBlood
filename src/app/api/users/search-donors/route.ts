import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    const bloodGroup = searchParams.get("bloodGroup");
    const district = searchParams.get("district");
    const upazila = searchParams.get("upazila");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    const query: any = {
      status: "active",
      isAvailable: true,
    };

    if (bloodGroup && bloodGroup.trim() !== "") {
      query.bloodGroup = bloodGroup.toUpperCase().trim();
    }

    if (district && district.trim() !== "") {
      query["location.address.district"] = {
        $regex: new RegExp(district.trim(), "i"),
      };
    }

    if (upazila && upazila.trim() !== "") {
      query["location.address.upazila"] = {
        $regex: new RegExp(upazila.trim(), "i"),
      };
    }

    const skip = (page - 1) * limit;

    // Aggregate instead of find
    const donors = await UserModel.aggregate([
      { $match: query },

      {
        $addFields: {
          totalDonation: { $size: "$donationHistory" },
          lastDonation: { $max: "$donationHistory.date" },
        },
      },

      {
        $sort: { lastDonation: 1, createdAt: -1 },
      },

      { $skip: skip },
      { $limit: limit },

      {
        $project: {
          avatar: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          bloodGroup: 1,
          location: 1,
          lastDonation: 1,
          createdAt: 1,
          totalDonation: 1,
        },
      },
    ]);
    console.log(donors);
    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      success: true,
      data: donors,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to search donors",
        data: [],
      },
      { status: 500 },
    );
  }
}

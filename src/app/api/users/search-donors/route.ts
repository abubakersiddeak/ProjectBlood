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

    if (bloodGroup && bloodGroup.trim() !== "" && bloodGroup !== "All") {
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

    const donors = await UserModel.aggregate([
      { $match: query },
      {
        $project: {
          avatar: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          bloodGroup: 1,
          location: 1,
          lastDonation: "$lastDonationDate", // Virtual এর বদলে সরাসরি ফিল্ড
          createdAt: 1,
          totalDonation: "$donationCount", // Virtual এর বদলে সরাসরি ফিল্ড
        },
      },
      { $sort: { lastDonation: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await UserModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: donors,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

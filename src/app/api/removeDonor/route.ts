// app/api/donation/remove-donor/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const { requestId, donorId } = await req.json();

    if (!requestId || !donorId) {
      return NextResponse.json(
        { success: false, message: "Missing requestId or donorId" },
        { status: 400 },
      );
    }

    // Get the request first
    const request = await BloodDonationReqModel.findById(requestId);

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    // Remove donor
    request.potentialDonors = request.potentialDonors.filter(
      (d) => d.donorId.toString() !== donorId,
    );

    // Update status if in-progress
    if (request.donationStatus === "in-progress") {
      request.donationStatus = "pending";
    }

    await request.save();

    return NextResponse.json({
      success: true,
      message: "Donor removed and status updated successfully",
      data: request,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import { auth } from "@/auth";
import { IPotentialDonor } from "@/types/modelTyps";
import { Types } from "mongoose";

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;
    console.log(params);
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await dbConnect();

    const bloodReq = await BloodDonationReqModel.findById(id);
    if (!bloodReq) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Check if user already in potentialDonors
    const isAlreadyDonor = bloodReq.potentialDonors.some(
      (donor: IPotentialDonor) => donor.donorId?.toString() === userId,
    );

    if (isAlreadyDonor) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already responded to this request",
        },
        { status: 400 },
      );
    }

    // Add user to potentialDonors
    bloodReq.potentialDonors.push({
      donorId: new Types.ObjectId(userId) as any,
      status: "interested",
      appliedAt: new Date(),
    });
    bloodReq.donationStatus = "in-progress";
    await bloodReq.save();

    return NextResponse.json({
      success: true,
      message: "Successfully registered interest for donation",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Donate API Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}

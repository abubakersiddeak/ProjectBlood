// app/api/bloodDonationReq/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import { auth } from "@/auth";
import { Types } from "mongoose";

// DELETE - Delete a blood donation request
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;

    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to continue." },
        { status: 401 },
      );
    }

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid request ID format." },
        { status: 400 },
      );
    }

    // Connect to database
    await dbConnect();

    // Find the request
    const bloodReq = await BloodDonationReqModel.findById(id);

    if (!bloodReq) {
      return NextResponse.json(
        { success: false, message: "Blood donation request not found." },
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

    // Check if the user is the owner of the request
    if (bloodReq.requesterId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to delete this request.",
        },
        { status: 403 },
      );
    }

    // Optional: Prevent deletion if request is fulfilled
    if (bloodReq.donationStatus === "success") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete a fulfilled request. Please cancel it first.",
        },
        { status: 400 },
      );
    }

    // Delete the request
    await BloodDonationReqModel.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Blood donation request deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Delete Blood Request API Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}

// GET - Get a single blood donation request by ID
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid request ID format." },
        { status: 400 },
      );
    }

    await dbConnect();

    const bloodReq = await BloodDonationReqModel.findById(id)
      .populate("requesterId", "name email phone")
      .populate("potentialDonors.donorId", "name email phone bloodGroup")
      .lean();

    if (!bloodReq) {
      return NextResponse.json(
        { success: false, message: "Blood donation request not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: bloodReq,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Get Blood Request API Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}

// PATCH - Update a blood donation request
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;

    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to continue." },
        { status: 401 },
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid request ID format." },
        { status: 400 },
      );
    }

    await dbConnect();

    const body = await req.json();

    const bloodReq = await BloodDonationReqModel.findById(id);

    if (!bloodReq) {
      return NextResponse.json(
        { success: false, message: "Blood donation request not found." },
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

    // Check ownership
    if (bloodReq.requesterId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to update this request.",
        },
        { status: 403 },
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      "recipientName",
      "bloodGroup",
      "totalUnitsNeeded",
      "urgency",
      "hospitalName",
      "recipientPhone",
      "location",
      "donationDate",
      "donationTime",
      "additionalMessage",
      "donationStatus",
      "unitsFulfilled",
    ];

    const updates: any = {};
    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const updatedRequest = await BloodDonationReqModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("requesterId", "name email phone");

    return NextResponse.json(
      {
        success: true,
        message: "Blood donation request updated successfully.",
        data: updatedRequest,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Update Blood Request API Error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 },
    );
  }
}

// PUT - Register interest for donation (existing code)
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;

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
      (donor: any) => donor.donorId?.toString() === userId,
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

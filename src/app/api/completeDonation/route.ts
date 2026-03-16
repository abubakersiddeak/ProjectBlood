import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import DonationRecordModel from "@/models/DonationRecordModel";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import UserModel from "@/models/UserModel";
import mongoose from "mongoose";

function extractId(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString();
}

export async function POST(req: NextRequest) {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const authSession = await auth();

    if (!authSession?.user) {
      await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await dbConnect();

    const body = await req.json();

    // ✅ Debug logging
    console.log("📦 Received body:", JSON.stringify(body, null, 2));

    const {
      requestId,
      donorId,
      requesterId,
      bloodGroup,
      hospitalName,
      unitsDonated = 1,
      rating = 5,
      reviewMessage = "",
    } = body;

    const safeRequestId = extractId(requestId);
    const safeDonorId = extractId(donorId);
    const safeRequesterId = extractId(requesterId);

    // ✅ Debug extracted IDs
    console.log("🔑 Extracted IDs:", {
      safeRequestId,
      safeDonorId,
      safeRequesterId,
    });

    // Validation
    if (
      !safeRequestId ||
      !safeDonorId ||
      !safeRequesterId ||
      !bloodGroup ||
      !hospitalName
    ) {
      await dbSession.abortTransaction();
      console.error("❌ Missing fields:", {
        safeRequestId: !!safeRequestId,
        safeDonorId: !!safeDonorId,
        safeRequesterId: !!safeRequesterId,
        bloodGroup: !!bloodGroup,
        hospitalName: !!hospitalName,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          debug: {
            safeRequestId: !!safeRequestId,
            safeDonorId: !!safeDonorId,
            safeRequesterId: !!safeRequesterId,
            bloodGroup: !!bloodGroup,
            hospitalName: !!hospitalName,
          },
        },
        { status: 400 },
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(safeRequestId) ||
      !mongoose.Types.ObjectId.isValid(safeDonorId) ||
      !mongoose.Types.ObjectId.isValid(safeRequesterId)
    ) {
      await dbSession.abortTransaction();
      console.error("❌ Invalid ObjectId format:", {
        safeRequestId,
        safeDonorId,
        safeRequesterId,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID format",
          debug: {
            safeRequestId,
            safeDonorId,
            safeRequesterId,
          },
        },
        { status: 400 },
      );
    }

    // Check duplicate
    const existingRecord = await DonationRecordModel.findOne({
      requestId: new mongoose.Types.ObjectId(safeRequestId),
      donorId: new mongoose.Types.ObjectId(safeDonorId),
    }).session(dbSession);

    if (existingRecord) {
      await dbSession.abortTransaction();
      console.warn("⚠️ Duplicate donation record");
      return NextResponse.json(
        {
          success: false,
          message: "Donation already confirmed for this donor",
        },
        { status: 409 },
      );
    }

    // Get request
    const request =
      await BloodDonationReqModel.findById(safeRequestId).session(dbSession);

    if (!request) {
      await dbSession.abortTransaction();
      console.error("❌ Request not found:", safeRequestId);
      return NextResponse.json(
        { success: false, message: "Blood donation request not found" },
        { status: 404 },
      );
    }

    console.log("✅ Request found:", {
      id: request._id,
      status: request.donationStatus,
      potentialDonorsCount: request.potentialDonors?.length || 0,
    });

    if (request.donationStatus === "success") {
      await dbSession.abortTransaction();
      console.warn("⚠️ Request already fulfilled");
      return NextResponse.json(
        { success: false, message: "This request is already fulfilled" },
        { status: 400 },
      );
    }

    // ✅ Check if potentialDonors exists
    if (!request.potentialDonors || request.potentialDonors.length === 0) {
      await dbSession.abortTransaction();
      console.error("❌ No potential donors found");
      return NextResponse.json(
        {
          success: false,
          message: "No potential donors in this request",
        },
        { status: 400 },
      );
    }

    const donorIndex = request.potentialDonors.findIndex(
      (d) => d.donorId.toString() === safeDonorId,
    );

    console.log("🔍 Donor search:", {
      safeDonorId,
      donorIndex,
      potentialDonors: request.potentialDonors.map((d) => ({
        donorId: d.donorId.toString(),
        status: d.status,
      })),
    });

    if (donorIndex === -1) {
      await dbSession.abortTransaction();
      console.error("❌ Donor not in potential donors list");
      return NextResponse.json(
        {
          success: false,
          message: "Donor not found in potential donors list",
          debug: {
            searchingFor: safeDonorId,
            availableDonors: request.potentialDonors.map((d) =>
              d.donorId.toString(),
            ),
          },
        },
        { status: 400 },
      );
    }

    // 1️⃣ Create donation record
    console.log("💾 Creating donation record...");
    const [donationRecord] = await DonationRecordModel.create(
      [
        {
          requestId: new mongoose.Types.ObjectId(safeRequestId),
          donorId: new mongoose.Types.ObjectId(safeDonorId),
          requesterId: new mongoose.Types.ObjectId(safeRequesterId),
          bloodGroup,
          hospitalName,
          unitsDonated,
          rating,
          reviewMessage,
          donationDate: new Date(),
        },
      ],
      { session: dbSession },
    );

    console.log("✅ Donation record created:", donationRecord._id);

    // 2️⃣ Update request
    console.log("📝 Updating request...");
    request.unitsFulfilled = (request.unitsFulfilled || 0) + unitsDonated;
    request.potentialDonors[donorIndex].status = "confirmed";
    request.potentialDonors[donorIndex].confirmedAt = new Date();

    if (request.unitsFulfilled >= request.totalUnitsNeeded) {
      request.donationStatus = "success";
      request.completedAt = new Date();
    } else {
      request.donationStatus = "in-progress";
    }

    await request.save({ session: dbSession });
    console.log("✅ Request updated");

    // 3️⃣ Update donor
    console.log("👤 Updating donor...");
    const donor = await UserModel.findById(safeDonorId).session(dbSession);

    if (!donor) {
      await dbSession.abortTransaction();
      console.error("❌ Donor not found:", safeDonorId);
      return NextResponse.json(
        { success: false, message: "Donor not found" },
        { status: 404 },
      );
    }

    donor.donationCount = (donor.donationCount || 0) + 1;
    donor.lastDonationDate = new Date();

    await donor.save({ session: dbSession });
    console.log("✅ Donor updated");

    // ✅ Commit transaction
    await dbSession.commitTransaction();
    console.log("✅ Transaction committed successfully");

    return NextResponse.json({
      success: true,
      message: "Donation confirmed successfully",
      data: {
        donationRecord,
        updatedRequest: {
          unitsFulfilled: request.unitsFulfilled,
          totalUnitsNeeded: request.totalUnitsNeeded,
          donationStatus: request.donationStatus,
          completedAt: request.completedAt,
        },
        updatedDonor: {
          donationCount: donor.donationCount,
          lastDonationDate: donor.lastDonationDate,
        },
      },
    });
  } catch (error: any) {
    await dbSession.abortTransaction();
    console.error("💥 Donation confirm error:", error);
    console.error("Error stack:", error.stack);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        { status: 400 },
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate donation record" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to confirm donation",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  } finally {
    dbSession.endSession();
  }
}

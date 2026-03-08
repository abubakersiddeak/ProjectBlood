import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import UserModel from "@/models/UserModel";
import { auth } from "@/auth";

export async function GET() {
  try {
    await dbConnect();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requests = await BloodDonationReqModel.find({
      bloodGroup: user.bloodGroup,
      donationStatus: { $in: ["pending"] },
      donationDate: { $gte: today },
    })
      .populate("requesterId", "fullName email")
      .sort({ donationDate: 1 })
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UserModel from "@/models/UserModel";
import BloodDonationReqModel from "@/models/BloodDonationReqModel";
import { auth } from "@/auth";
import mongoose from "mongoose";
import DonationRecordModel from "@/models/DonationRecordModel";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const role = session?.user.role || "user";
  const userId = session?.user.id;

  if (role === "user") {
    try {
      await dbConnect();

      // ✅ User এর সব তথ্য fetch করা
      const user = await UserModel.findById(userId).select(
        "fullName bloodGroup isAvailable donationCount lastDonationDate location phone avatar followerCount",
      );

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 },
        );
      }

      // ✅ নিজের তৈরি Blood Requests
      const ownCreateBloodReq = await BloodDonationReqModel.aggregate([
        {
          $match: {
            requesterId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: "$donationStatus",
            count: { $sum: 1 },
          },
        },
      ]);

      // ✅ Total requests count
      const totalRequestsCreated = await BloodDonationReqModel.countDocuments({
        requesterId: userId,
      });

      // ✅ Active/Pending requests
      const activeRequests = await BloodDonationReqModel.countDocuments({
        requesterId: userId,
        donationStatus: { $in: ["pending", "in-progress"] },
      });

      // ✅ নিজে যে requests এ respond করেছে (Potential Donor হিসেবে)
      const respondedRequests = await BloodDonationReqModel.countDocuments({
        "potentialDonors.donorId": new mongoose.Types.ObjectId(userId),
      });

      // ✅ Confirmed donations (যেখানে আমি donor হিসেবে confirmed)
      const confirmedDonations = await BloodDonationReqModel.countDocuments({
        potentialDonors: {
          $elemMatch: {
            donorId: new mongoose.Types.ObjectId(userId),
            status: "confirmed",
          },
        },
      });

      // ✅ Donation Records from DonationRecord collection
      const donationRecords = await DonationRecordModel.find({
        donorId: userId,
      })
        .sort({ donationDate: -1 })
        .limit(5)
        .populate("requesterId", "fullName avatar")
        .lean();

      // ✅ Total donations count (from DonationRecord)
      const totalDonations = await DonationRecordModel.countDocuments({
        donorId: userId,
      });

      // ✅ Total verified donations
      const verifiedDonations = await DonationRecordModel.countDocuments({
        donorId: userId,
        isVerified: true,
      });

      // ✅ Last donation date calculation
      const lastDonationDate = user.lastDonationDate || null;
      let nextEligibleDate = null;
      let canDonateNow = true;
      let daysUntilEligible = 0;

      if (lastDonationDate) {
        // পুরুষদের জন্য 90 days, মহিলাদের জন্য 120 days gap
        const gapDays = 90; // আপনি চাইলে gender based করতে পারেন

        const lastDate = new Date(lastDonationDate);
        nextEligibleDate = new Date(lastDate);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + gapDays);

        const today = new Date();
        const diffTime = nextEligibleDate.getTime() - today.getTime();
        daysUntilEligible = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        canDonateNow = daysUntilEligible <= 0;
      }

      // ✅ Lives saved calculation (1 donation = 3 lives)
      const livesSaved = totalDonations * 3;

      // ✅ Donor level calculation
      let donorLevel = "New Donor";
      let nextLevel = "Bronze";
      let progressPercentage = 0;
      let donationsForNextLevel = 5;

      if (totalDonations >= 20) {
        donorLevel = "Platinum";
        nextLevel = "Legend";
        progressPercentage = 100;
        donationsForNextLevel = 0;
      } else if (totalDonations >= 15) {
        donorLevel = "Gold";
        nextLevel = "Platinum";
        progressPercentage = ((totalDonations - 15) / 5) * 100;
        donationsForNextLevel = 20 - totalDonations;
      } else if (totalDonations >= 10) {
        donorLevel = "Silver";
        nextLevel = "Gold";
        progressPercentage = ((totalDonations - 10) / 5) * 100;
        donationsForNextLevel = 15 - totalDonations;
      } else if (totalDonations >= 5) {
        donorLevel = "Bronze";
        nextLevel = "Silver";
        progressPercentage = ((totalDonations - 5) / 5) * 100;
        donationsForNextLevel = 10 - totalDonations;
      } else if (totalDonations > 0) {
        donorLevel = "Beginner";
        nextLevel = "Bronze";
        progressPercentage = (totalDonations / 5) * 100;
        donationsForNextLevel = 5 - totalDonations;
      }

      // ✅ This year's donations
      const currentYear = new Date().getFullYear();
      const donationsThisYear = await DonationRecordModel.countDocuments({
        donorId: userId,
        donationDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      });

      // ✅ Average rating from donation records
      const ratingStats = await DonationRecordModel.aggregate([
        { $match: { donorId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
          },
        },
      ]);

      const averageRating =
        ratingStats.length > 0 ? ratingStats[0].avgRating : 0;
      const totalRatings =
        ratingStats.length > 0 ? ratingStats[0].totalRatings : 0;

      // ✅ Nearby active requests count - FIXED VERSION
      let nearbyRequests = 0;

      if (
        user.location &&
        user.location.coordinates &&
        user.location.coordinates.length === 2
      ) {
        try {
          // Ensure 2dsphere index exists on BloodDonationReqModel
          const nearbyResult = await BloodDonationReqModel.aggregate([
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: user.location.coordinates,
                },
                distanceField: "distance",
                maxDistance: 10000, // 10km in meters
                spherical: true,
                query: {
                  donationStatus: { $in: ["pending", "in-progress"] },
                },
              },
            },
            {
              $count: "total",
            },
          ]);

          nearbyRequests = nearbyResult.length > 0 ? nearbyResult[0].total : 0;
        } catch (geoError: any) {
          console.log("Geospatial query error:", geoError.message);

          // Fallback: Just count all active requests
          nearbyRequests = await BloodDonationReqModel.countDocuments({
            donationStatus: { $in: ["pending", "in-progress"] },
          });
        }
      } else {
        // If user location is not available
        nearbyRequests = await BloodDonationReqModel.countDocuments({
          donationStatus: { $in: ["pending", "in-progress"] },
        });
      }

      // ✅ Matching blood group requests
      const matchingBloodRequests = await BloodDonationReqModel.countDocuments({
        bloodGroup: user.bloodGroup,
        donationStatus: "pending",
        donationDate: { $gte: new Date() }, // only upcoming dates
      });

      // ✅ Achievement badges
      const badges = [];
      if (totalDonations >= 1) badges.push({ name: "First Drop", icon: "🩸" });
      if (totalDonations >= 5) badges.push({ name: "Life Saver", icon: "💝" });
      if (totalDonations >= 10) badges.push({ name: "Hero", icon: "🦸" });
      if (totalDonations >= 15) badges.push({ name: "Champion", icon: "🏆" });
      if (totalDonations >= 20) badges.push({ name: "Legend", icon: "⭐" });
      if (averageRating >= 4.5)
        badges.push({ name: "Highly Rated", icon: "⭐⭐⭐⭐⭐" });
      if (respondedRequests >= 10)
        badges.push({ name: "Quick Responder", icon: "⚡" });

      // ✅ Final Summary Object
      const summary = {
        // User Basic Info
        user: {
          fullName: user.fullName,
          bloodGroup: user.bloodGroup,
          isAvailable: user.isAvailable,
          phone: user.phone,
          avatar: user.avatar,
          location: user.location,
          followerCount: user.followerCount || 0,
        },

        // Donation Statistics
        donations: {
          total: totalDonations,
          thisYear: donationsThisYear,
          verified: verifiedDonations,
          livesSaved: livesSaved,
          lastDonationDate: lastDonationDate,
          nextEligibleDate: nextEligibleDate,
          canDonateNow: canDonateNow,
          daysUntilEligible: daysUntilEligible > 0 ? daysUntilEligible : 0,
        },

        // Request Statistics
        requests: {
          totalCreated: totalRequestsCreated,
          active: activeRequests,
          responded: respondedRequests,
          confirmed: confirmedDonations,
          byStatus: ownCreateBloodReq,
        },

        // Donor Level & Progress
        level: {
          current: donorLevel,
          next: nextLevel,
          progressPercentage: Math.round(progressPercentage),
          donationsForNextLevel: donationsForNextLevel,
        },

        // Rating & Reviews
        rating: {
          average: averageRating ? averageRating.toFixed(1) : "0.0",
          totalRatings: totalRatings,
        },

        // Nearby Opportunities
        opportunities: {
          nearbyRequests: nearbyRequests,
          matchingBloodRequests: matchingBloodRequests,
        },

        // Recent Donation Records
        recentDonations: donationRecords,

        // Achievements
        badges: badges,
      };

      return NextResponse.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error("User summary error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Failed to fetch summary",
        },
        { status: 500 },
      );
    }
  } else {
    // ✅ Admin/Volunteer summary
    try {
      await dbConnect();

      // 1️⃣ Total users
      const totalUsers = await UserModel.countDocuments();
      const totalAdmins = await UserModel.countDocuments({ role: "admin" });
      const totalVolunteer = await UserModel.countDocuments({
        role: "volunteer",
      });

      // 2️⃣ Blood donation requests counts by status
      const requestsCount = await BloodDonationReqModel.aggregate([
        {
          $group: {
            _id: "$donationStatus",
            count: { $sum: 1 },
          },
        },
      ]);

      // Convert array to object
      const statusCounts: Record<string, number> = {
        pending: 0,
        "in-progress": 0,
        success: 0,
        cancel: 0,
      };

      requestsCount.forEach((item) => {
        if (item._id) {
          statusCounts[item._id] = item.count;
        }
      });

      // 3️⃣ Total donation records
      const totalDonationRecords = await DonationRecordModel.countDocuments();
      const verifiedDonations = await DonationRecordModel.countDocuments({
        isVerified: true,
      });

      // 4️⃣ Blood group wise statistics
      const bloodGroupStats = await UserModel.aggregate([
        {
          $group: {
            _id: "$bloodGroup",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // 5️⃣ Recent activities (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentRequests = await BloodDonationReqModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      const recentDonations = await DonationRecordModel.countDocuments({
        donationDate: { $gte: sevenDaysAgo },
      });

      const summary = {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          volunteers: totalVolunteer,
          regularUsers: totalUsers - totalAdmins - totalVolunteer,
        },
        requests: {
          total:
            statusCounts.pending +
            statusCounts["in-progress"] +
            statusCounts.success +
            statusCounts.cancel,
          pending: statusCounts.pending,
          inProgress: statusCounts["in-progress"],
          success: statusCounts.success,
          cancel: statusCounts.cancel,
        },
        donations: {
          total: totalDonationRecords,
          verified: verifiedDonations,
          unverified: totalDonationRecords - verifiedDonations,
        },
        bloodGroups: bloodGroupStats,
        recentActivity: {
          requests: recentRequests,
          donations: recentDonations,
        },
      };

      return NextResponse.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error("Dashboard summary error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Failed to fetch dashboard summary",
        },
        { status: 500 },
      );
    }
  }
}

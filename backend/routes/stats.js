import express from "express";
import Teacher from "../models/Teacher.js";
import Review from "../models/Review.js";
import AdminReview from "../models/AdminReview.js";
import User from "../models/User.js";
import Institution from "../models/Institution.js";

const router = express.Router();

router.get("/top-teachers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const teachers = await Teacher.find({ deleted: false })
      .populate("institution")
      .sort({ avgRating: -1, totalReviews: -1 })
      .limit(limit);

    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/trending-reviews", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const reviewsRaw = await Review.find({ deleted: false, reported: false })
      .populate("user", "role")
      .populate("teacher", "name")
      .populate("course", "name")
      .sort({ helpful: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    const reviews = reviewsRaw.map((r) => ({
      ...r,
      user: r.user ? { _id: r.user._id || r.user, role: r.user.role, name: "Anonymous" } : undefined,
    }));

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const totalReviewsRegular = await Review.countDocuments({ deleted: false });
    const totalReviewsAdmin = await AdminReview.countDocuments({ deleted: false });
    const totalReviews = totalReviewsRegular + totalReviewsAdmin;
    const totalTeachers = await Teacher.countDocuments({ deleted: false });
    const totalUsers = await User.countDocuments({ deleted: false });
    const totalInstitutions = await Institution.countDocuments({
      deleted: false,
    });

    const avgRating = await Review.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: null,
          avgCommunication: { $avg: "$ratings.communication" },
          avgCollaboration: { $avg: "$ratings.collaboration" },
          avgEthics: { $avg: "$ratings.ethics" },
          avgResponsibility: { $avg: "$ratings.responsibility" },
          avgProblemSolving: { $avg: "$ratings.problemSolving" },
        },
      },
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const newUsersToday = await User.countDocuments({ deleted: false, createdAt: { $gte: startOfToday } });
    const ratingsTodayRegular = await Review.countDocuments({ deleted: false, createdAt: { $gte: startOfToday } });
    const ratingsTodayAdmin = await AdminReview.countDocuments({ deleted: false, createdAt: { $gte: startOfToday } });
    const ratingsToday = ratingsTodayRegular + ratingsTodayAdmin;

    const ratingActivityWeekRawRegular = await Review.aggregate([
      { $match: { deleted: false, createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const ratingActivityWeekRawAdmin = await AdminReview.aggregate([
      { $match: { deleted: false, createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const ratingActivityWeekMap = new Map();
    for (const r of ratingActivityWeekRawRegular) ratingActivityWeekMap.set(r._id, (ratingActivityWeekMap.get(r._id) || 0) + r.count);
    for (const r of ratingActivityWeekRawAdmin) ratingActivityWeekMap.set(r._id, (ratingActivityWeekMap.get(r._id) || 0) + r.count);
    const ratingActivityWeek = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      return ratingActivityWeekMap.get(key) || 0;
    });

    const ratingDistributionRawRegular = await Review.aggregate([
      { $match: { deleted: false } },
      {
        $project: {
          overall: {
            $round: [
              { $avg: [
                "$ratings.communication",
                "$ratings.collaboration",
                "$ratings.ethics",
                "$ratings.responsibility",
                "$ratings.problemSolving",
              ] },
              0,
            ],
          },
        },
      },
      { $group: { _id: "$overall", count: { $sum: 1 } } },
    ]);
    const ratingDistributionRawAdmin = await AdminReview.aggregate([
      { $match: { deleted: false } },
      {
        $project: {
          overall: { $round: [{ $avg: ["$ratings.teaching", "$ratings.discipline", "$ratings.attitude"] }, 0] },
        },
      },
      { $group: { _id: "$overall", count: { $sum: 1 } } },
    ]);
    const distributionMap = new Map();
    for (const r of ratingDistributionRawRegular) distributionMap.set(r._id, (distributionMap.get(r._id) || 0) + r.count);
    for (const r of ratingDistributionRawAdmin) distributionMap.set(r._id, (distributionMap.get(r._id) || 0) + r.count);
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => distributionMap.get(star) || 0);

    const startMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
    const startPrevMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, 1);
    const endPrevMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 0, 23, 59, 59, 999);
    const avgMonthRegular = await Review.aggregate([
      { $match: { deleted: false, createdAt: { $gte: startMonth } } },
      { $project: { overall: { $avg: ["$ratings.communication", "$ratings.collaboration", "$ratings.ethics", "$ratings.responsibility", "$ratings.problemSolving"] } } },
      { $group: { _id: null, avg: { $avg: "$overall" } } },
    ]);
    const avgMonthAdmin = await AdminReview.aggregate([
      { $match: { deleted: false, createdAt: { $gte: startMonth } } },
      { $project: { overall: { $avg: ["$ratings.teaching", "$ratings.discipline", "$ratings.attitude"] } } },
      { $group: { _id: null, avg: { $avg: "$overall" } } },
    ]);
    const avgPrevMonthRegular = await Review.aggregate([
      { $match: { deleted: false, createdAt: { $gte: startPrevMonth, $lte: endPrevMonth } } },
      { $project: { overall: { $avg: ["$ratings.communication", "$ratings.collaboration", "$ratings.ethics", "$ratings.responsibility", "$ratings.problemSolving"] } } },
      { $group: { _id: null, avg: { $avg: "$overall" } } },
    ]);
    const avgPrevMonthAdmin = await AdminReview.aggregate([
      { $match: { deleted: false, createdAt: { $gte: startPrevMonth, $lte: endPrevMonth } } },
      { $project: { overall: { $avg: ["$ratings.teaching", "$ratings.discipline", "$ratings.attitude"] } } },
      { $group: { _id: null, avg: { $avg: "$overall" } } },
    ]);
    const avgMonth = (avgMonthRegular[0]?.avg || 0) + (avgMonthAdmin[0]?.avg || 0);
    const avgPrevMonth = (avgPrevMonthRegular[0]?.avg || 0) + (avgPrevMonthAdmin[0]?.avg || 0);
    const avgDeltaMonth = (avgMonth - avgPrevMonth);

    const last6 = Array.from({ length: 6 }).map((_, i) => new Date(startMonth.getFullYear(), startMonth.getMonth() - (5 - i), 1));
    const userGrowthRaw = await User.aggregate([
      { $match: { deleted: false, createdAt: { $gte: last6[0] } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const growthMap = new Map(userGrowthRaw.map((r) => [r._id, r.count]));
    const userGrowth = last6.map((d) => growthMap.get(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`) || 0);

    const topRatedTeachers = await Teacher.find({ deleted: false })
      .sort({ avgRating: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalReviews,
        totalTeachers,
        totalUsers,
        totalInstitutions,
        averageRatings: avgRating[0] || {},
        topRatedTeachers,
        newUsersToday,
        ratingsToday,
        ratingActivityWeek,
        ratingDistribution,
        avgDeltaMonth,
        userGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

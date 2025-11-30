import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import AdminReview from "../models/AdminReview.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Create admin-to-admin review
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("to").notEmpty(),
    body("ratings.communication").isFloat({ min: 1, max: 5 }),
    body("ratings.collaboration").isFloat({ min: 1, max: 5 }),
    body("ratings.ethics").isFloat({ min: 1, max: 5 }),
    body("ratings.responsibility").isFloat({ min: 1, max: 5 }),
    body("ratings.problemSolving").isFloat({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { to, ratings, comment } = req.body;
      const target = await User.findById(to).select("role deleted");
      if (!target || target.deleted || target.role !== "admin") {
        return res.status(404).json({ success: false, message: "Target admin not found" });
      }

      const existing = await AdminReview.findOne({ from: req.userId, to, deleted: false });
      if (existing) {
        existing.ratings = ratings;
        existing.comment = comment;
        await existing.save();
        return res.json({ success: true, message: "Review updated", data: existing });
      }

      const review = new AdminReview({ from: req.userId, to, ratings, comment });
      await review.save();
      res.status(201).json({ success: true, message: "Review created", data: review });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// List reviews for an admin (as target)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const to = req.query.to;
    const filter = { deleted: false };
    if (to) filter.to = to;

    const reviewsRaw = await AdminReview.find(filter)
      .populate("from", "role")
      .populate("to", "name nim_nip")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const reviews = reviewsRaw.map((r) => ({
      ...r,
      from: r.from ? { _id: r.from._id || r.from, role: r.from.role, name: "Anonymous" } : undefined,
    }));

    const total = await AdminReview.countDocuments(filter);
    res.json({ success: true, data: reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Summary averages for spider chart
router.get("/summary", authenticate, authorize("admin"), async (req, res) => {
  try {
    const to = req.query.to;
    if (!to) {
      return res.status(400).json({ success: false, message: "Query 'to' is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(to)) {
      return res.json({ success: true, data: { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 } });
    }

    const pipeline = [
      { $match: { to: mongoose.Types.ObjectId(to), deleted: false } },
      {
        $group: {
          _id: "$to",
          communication: { $avg: "$ratings.communication" },
          collaboration: { $avg: "$ratings.collaboration" },
          ethics: { $avg: "$ratings.ethics" },
          responsibility: { $avg: "$ratings.responsibility" },
          problemSolving: { $avg: "$ratings.problemSolving" },
          count: { $sum: 1 },
        },
      },
    ];

    const result = await AdminReview.aggregate(pipeline);
    const summary = result[0] || { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 };
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

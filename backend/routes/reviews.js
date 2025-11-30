import express from "express";
import { body, validationResult } from "express-validator";
import Review from "../models/Review.js";
import Teacher from "../models/Teacher.js";
import { authenticate } from "../middlewares/auth.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deleted: false };
    if (req.query.teacher) filter.teacher = req.query.teacher;
    if (req.query.course) filter.course = req.query.course;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.toId && req.query.toRole === "dosen") {
      filter.teacher = req.query.toId;
    }

    const reviews = await Review.find(filter)
      .populate("user", "role")
      .populate("teacher", "name user")
      .populate("course", "name code")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const anonymized = reviews.map((r) => ({
      ...r,
      user: r.user
        ? { _id: r.user._id || r.user, role: r.user.role, name: "Anonymous" }
        : undefined,
    }));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: anonymized,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/summary", authenticate, async (req, res) => {
  try {
    const { user, teacher, course, raterRole } = req.query;
    const match = { deleted: false };
    if (user && mongoose.Types.ObjectId.isValid(user)) {
      match.user = new mongoose.Types.ObjectId(user);
    }
    if (teacher && mongoose.Types.ObjectId.isValid(teacher)) {
      match.teacher = new mongoose.Types.ObjectId(teacher);
    }
    if (course && mongoose.Types.ObjectId.isValid(course)) {
      match.course = new mongoose.Types.ObjectId(course);
    }

    const pipeline = [{ $match: match }];

    if (raterRole === "mahasiswa" || raterRole === "dosen") {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDoc",
          },
        },
        { $unwind: "$userDoc" },
        { $match: { "userDoc.role": raterRole } }
      );
    }

    pipeline.push({
      $group: {
        _id: null,
        communication: { $avg: "$ratings.communication" },
        collaboration: { $avg: "$ratings.collaboration" },
        ethics: { $avg: "$ratings.ethics" },
        responsibility: { $avg: "$ratings.responsibility" },
        problemSolving: { $avg: "$ratings.problemSolving" },
        count: { $sum: 1 },
      },
    });

    const result = await Review.aggregate(pipeline);

    const data = result[0] || {
      communication: 0,
      collaboration: 0,
      ethics: 0,
      responsibility: 0,
      problemSolving: 0,
      count: 0,
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "role")
      .populate("teacher", "name")
      .populate("course", "name code")
      .lean();

    if (!review || review.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const data = review
      ? {
          ...review,
          user: review.user
            ? { _id: review.user._id || review.user, role: review.user.role, name: "Anonymous" }
            : undefined,
        }
      : review;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/",
  authenticate,
  [
    body("teacher").notEmpty().withMessage("Teacher ID is required"),
    body("ratings.communication")
      .isInt({ min: 1, max: 5 })
      .withMessage("Communication rating must be 1-5"),
    body("ratings.collaboration")
      .isInt({ min: 1, max: 5 })
      .withMessage("Collaboration rating must be 1-5"),
    body("ratings.ethics")
      .isInt({ min: 1, max: 5 })
      .withMessage("Ethics rating must be 1-5"),
    body("ratings.responsibility")
      .isInt({ min: 1, max: 5 })
      .withMessage("Responsibility rating must be 1-5"),
    body("ratings.problemSolving")
      .isInt({ min: 1, max: 5 })
      .withMessage("Problem Solving rating must be 1-5"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { teacher, course, ratings, comment } = req.body;

      let review = await Review.findOne({ user: req.userId, teacher, deleted: false });
      if (review) {
        review.ratings = ratings || review.ratings;
        if (comment !== undefined) review.comment = comment;
        if (course) review.course = course;
        await review.save();
        await review.populate("teacher");
        const avgRating = await calculateAverageRating(teacher);
        const reviewCount = await Review.countDocuments({ teacher, deleted: false });
        await Teacher.findByIdAndUpdate(teacher, { avgRating, totalReviews: reviewCount });
        return res.json({ success: true, message: "Review updated", data: review });
      }

      review = new Review({ user: req.userId, teacher, course, ratings, comment });
      await review.save();
      await review.populate("teacher");

      const avgRating = await calculateAverageRating(teacher);
      const reviewCount = await Review.countDocuments({ teacher, deleted: false });
      await Teacher.findByIdAndUpdate(teacher, { avgRating, totalReviews: reviewCount });

      res.status(201).json({ success: true, message: "Review created", data: review });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put("/:id", authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { ratings, comment } = req.body;
    if (ratings) review.ratings = ratings;
    if (comment) review.comment = comment;

    await review.save();

    const avgRating = await calculateAverageRating(review.teacher);
    await Teacher.findByIdAndUpdate(review.teacher, { avgRating });

    res.json({ success: true, message: "Review updated", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/helpful", authenticate, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Helpful count updated", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/report", authenticate, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reported: true },
      { new: true }
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Review reported" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    review.deleted = true;
    await review.save();

    const avgRating = await calculateAverageRating(review.teacher);
    const reviewCount = await Review.countDocuments({
      teacher: review.teacher,
      deleted: false,
    });

    await Teacher.findByIdAndUpdate(review.teacher, {
      avgRating,
      totalReviews: reviewCount,
    });

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


async function calculateAverageRating(teacherId) {
  const reviews = await Review.find({ teacher: teacherId, deleted: false });

  if (reviews.length === 0) return 0;

  const avg =
    reviews.reduce((sum, review) => {
      const rating =
        (review.ratings.communication +
          review.ratings.collaboration +
          review.ratings.ethics +
          review.ratings.responsibility +
          review.ratings.problemSolving) /
        5;
      return sum + rating;
    }, 0) / reviews.length;

  return Math.round(avg * 10) / 10;
}

export default router;

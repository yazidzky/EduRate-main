import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Review from "../models/Review.js";
import StudentReview from "../models/StudentReview.js";
import Teacher from "../models/Teacher.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deleted: false };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.institution) filter.institution = req.query.institution;

    const users = await User.find(filter)
      .populate("institution", "name")
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("institution", "name")
      .select("-password");

    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user is admin or requesting their own data
    if (req.role !== "admin" && req.params.id !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["mahasiswa", "dosen", "admin"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Create user validation errors", errors.array(), "role:", req.body?.role);
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        name,
        email,
        password,
        role,
        institution,
        nim_nip,
        department,
        phone,
      } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      user = new User({
        name,
        email,
        password,
        role,
        institution,
        nim_nip,
        department,
        phone,
      });
      await user.save();

      const userResponse = await User.findById(user._id)
        .populate("institution", "name")
        .select("-password");

      res
        .status(201)
        .json({ success: true, message: "User created", data: userResponse });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update user
router.put("/:id", authenticate, async (req, res) => {
  try {
    // Check permissions
    if (req.role !== "admin" && req.params.id !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { name, email, nim_nip, department, phone, avatar } = req.body;

    // Prevent role changes unless admin
    const updateData = { name, email, nim_nip, department, phone, avatar };
    if (req.role === "admin") {
      const { role, institution } = req.body;
      if (role) updateData.role = role;
      if (institution) updateData.institution = institution;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("institution", "name")
      .select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await Enrollment.updateMany({ user: req.params.id, deleted: false }, { $set: { deleted: true } });
    await Course.updateMany({ enrolledStudents: req.params.id }, { $pull: { enrolledStudents: req.params.id } });

    const impactedTeacherIds = await Review.find({ user: req.params.id, deleted: false }).distinct("teacher");
    await Review.updateMany({ user: req.params.id, deleted: false }, { $set: { deleted: true } });
    for (const tid of impactedTeacherIds) {
      const remaining = await Review.find({ teacher: tid, deleted: false });
      const avg = remaining.length
        ? Math.round(
            (
              remaining.reduce(
                (sum, r) =>
                  sum +
                  ((
                    (r.ratings?.communication || 0) +
                    (r.ratings?.collaboration || 0) +
                    (r.ratings?.ethics || 0) +
                    (r.ratings?.responsibility || 0) +
                    (r.ratings?.problemSolving || 0)
                  ) / 5),
                0
              ) /
              remaining.length
            ) * 10
          ) / 10
        : 0;
      await Teacher.findByIdAndUpdate(tid, { avgRating: avg, totalReviews: remaining.length });
    }

    await StudentReview.updateMany({ from: req.params.id, deleted: false }, { $set: { deleted: true } });
    await StudentReview.updateMany({ to: req.params.id, deleted: false }, { $set: { deleted: true } });

    res.json({ success: true, message: "User updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user (soft delete, admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Cascade: soft-delete all enrollments of this user
    await Enrollment.updateMany(
      { user: req.params.id, deleted: false },
      { $set: { deleted: true } }
    );

    // Cascade: remove user from enrolledStudents arrays
    await Course.updateMany(
      { enrolledStudents: req.params.id },
      { $pull: { enrolledStudents: req.params.id } }
    );

    // Cascade: soft-delete all reviews by this user
    await Review.updateMany(
      { user: req.params.id, deleted: false },
      { $set: { deleted: true } }
    );

    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put(
  "/:id/password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      // Check permissions
      if (req.role !== "admin" && req.params.id !== req.userId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;

import express from "express";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Get enrollments for current user or all if admin
router.get("/", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deleted: false };
    if (req.role !== "admin") {
      filter.user = req.userId;
    } else {
      if (req.query.user) filter.user = req.query.user;
      if (req.query.course) filter.course = req.query.course;
      if (req.query.status) filter.status = req.query.status;
    }

    const enrollments = await Enrollment.find(filter)
      .populate("user", "name email nim_nip")
      .populate("course", "name code")
      .skip(skip)
      .limit(limit)
      .sort({ enrolledAt: -1 });

    const total = await Enrollment.countDocuments(filter);

    res.json({
      success: true,
      data: enrollments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get enrollment by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("user", "name email nim_nip")
      .populate("course", "name code");

    if (!enrollment || enrollment.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    // Check permissions
    if (req.role !== "admin" && enrollment.user._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enroll in a course
router.post(
  "/",
  authenticate,
  [body("course").notEmpty().withMessage("Course ID is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { course } = req.body;

      // Check if course exists and is not deleted
      const courseDoc = await Course.findById(course);
      if (!courseDoc || courseDoc.deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: req.userId,
        course,
        deleted: false,
      });

      if (existingEnrollment) {
        return res
          .status(400)
          .json({ success: false, message: "Already enrolled in this course" });
      }

      const enrollment = new Enrollment({
        user: req.userId,
        course,
      });

      await enrollment.save();

      // Add student to course's enrolledStudents array
      await Course.findByIdAndUpdate(course, {
        $addToSet: { enrolledStudents: req.userId },
      });

      const populatedEnrollment = await Enrollment.findById(enrollment._id)
        .populate("user", "name email nim_nip")
        .populate("course", "name code");

      res.status(201).json({
        success: true,
        message: "Enrolled successfully",
        data: populatedEnrollment,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Admin enroll a specific user into a course
router.post(
  "/admin",
  authenticate,
  authorize("admin"),
  [
    body("course").notEmpty().withMessage("Course ID is required"),
    body("user").notEmpty().withMessage("User ID is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { course, user } = req.body;

      if (!mongoose.Types.ObjectId.isValid(course) || !mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ success: false, message: "Invalid user or course id" });
      }

      const courseDoc = await Course.findById(course);
      if (!courseDoc || courseDoc.deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      // Check if already enrolled (active)
      const existingEnrollment = await Enrollment.findOne({ user, course, deleted: false });
      if (existingEnrollment) {
        return res.status(400).json({ success: false, message: "Already enrolled in this course" });
      }

      // If previously unenrolled (soft-deleted), restore it instead of creating new
      const softDeleted = await Enrollment.findOne({ user, course, deleted: true });
      let enrollment;
      if (softDeleted) {
        softDeleted.deleted = false;
        softDeleted.status = "active";
        softDeleted.enrolledAt = new Date();
        await softDeleted.save();
        enrollment = softDeleted;
      } else {
        enrollment = new Enrollment({ user, course });
        await enrollment.save();
      }

      await Course.findByIdAndUpdate(course, { $addToSet: { enrolledStudents: user } });

      const populatedEnrollment = await Enrollment.findById(enrollment._id)
        .populate("user", "name email nim_nip")
        .populate("course", "name code");

      res.status(201).json({ success: true, message: softDeleted ? "Re-enrolled successfully" : "Enrolled successfully", data: populatedEnrollment });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Update enrollment status
router.put("/:id", authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment || enrollment.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    // Check permissions
    if (req.role !== "admin" && enrollment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { status } = req.body;
    if (status) {
      enrollment.status = status;
      if (status === "completed") {
        enrollment.completedAt = new Date();
      }
    }

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("user", "name email nim_nip")
      .populate("course", "name code");

    res.json({
      success: true,
      message: "Enrollment updated",
      data: populatedEnrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin unenroll a specific user from a course (declare BEFORE /:id to avoid route conflicts)
router.delete(
  "/admin",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { user, course } = req.body || {};
      if (!user || !course) {
        return res.status(400).json({ success: false, message: "User and course are required" });
      }

      if (!mongoose.Types.ObjectId.isValid(course) || !mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ success: false, message: "Invalid user or course id" });
      }

      const enrollment = await Enrollment.findOne({ user, course, deleted: false });
      if (!enrollment) {
        return res.status(404).json({ success: false, message: "Enrollment not found" });
      }

      enrollment.deleted = true;
      await enrollment.save();

      await Course.findByIdAndUpdate(course, { $pull: { enrolledStudents: user } });

      res.json({ success: true, message: "Unenrolled successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Unenroll from course by enrollment id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment || enrollment.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    // Check permissions
    if (req.role !== "admin" && enrollment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    enrollment.deleted = true;
    await enrollment.save();

    // Remove student from course's enrolledStudents array
    await Course.findByIdAndUpdate(enrollment.course, {
      $pull: { enrolledStudents: enrollment.user },
    });

    res.json({ success: true, message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

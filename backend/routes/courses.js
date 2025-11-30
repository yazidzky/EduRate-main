import express from "express";
import { body, validationResult } from "express-validator";
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import StudentReview from "../models/StudentReview.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deleted: false };
    if (req.query.institution) filter.institution = req.query.institution;
    if (req.query.teacher) filter.teacher = req.query.teacher;

    const courses = await Course.find(filter)
      .populate("institution")
      .populate("teacher", "name user")
      .populate("enrolledStudents", "name nim_nip")
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("institution")
      .populate("teacher", "name user");

    if (!course || course.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("code").notEmpty().withMessage("Code is required"),
    body("institution").notEmpty().withMessage("Institution is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, code, institution, department, teacher, description, schedule, room, semester } =
        req.body;
      const enrolledStudents = Array.isArray(req.body.enrolledStudents) ? req.body.enrolledStudents : [];

      const course = new Course({
        name,
        code,
        institution,
        department,
        teacher,
        description,
        schedule,
        room,
        semester,
      });
      await course.save();

      if (teacher) {
        await Teacher.findByIdAndUpdate(teacher, { $addToSet: { courses: course._id } });
      }

      if (enrolledStudents.length > 0) {
        await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: { $each: enrolledStudents } } });
        for (const sid of enrolledStudents) {
          const exists = await Enrollment.findOne({ user: sid, course: course._id, deleted: false });
          if (!exists) {
            const enr = new Enrollment({ user: sid, course: course._id });
            await enr.save();
          }
        }
      }

      const populated = await Course.findById(course._id)
        .populate("institution")
        .populate("teacher", "name user")
        .populate("enrolledStudents", "name nim_nip");

      res
        .status(201)
        .json({ success: true, message: "Course created", data: populated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, code, department, teacher, description, schedule, room, semester, institution } = req.body;
    const prev = await Course.findById(req.params.id);
    const update = { name, code, department, teacher, description };
    if (schedule !== undefined) update.schedule = schedule;
    if (room !== undefined) update.room = room;
    if (semester !== undefined) update.semester = semester;
    if (institution !== undefined) update.institution = institution;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (teacher && prev && prev.teacher?.toString() !== teacher.toString()) {
      if (prev.teacher) {
        await Teacher.findByIdAndUpdate(prev.teacher, { $pull: { courses: course._id } });
      }
      await Teacher.findByIdAndUpdate(teacher, { $addToSet: { courses: course._id } });
    }

    await Enrollment.updateMany(
      { course: course._id, deleted: false },
      { $set: { deleted: true } }
    );
    await Review.updateMany(
      { course: course._id, deleted: false },
      { $set: { deleted: true } }
    );
    await StudentReview.updateMany(
      { course: course._id, deleted: false },
      { $set: { deleted: true } }
    );
    await Course.findByIdAndUpdate(course._id, { $set: { enrolledStudents: [] } });

    if (course.teacher) {
      const remaining = await Review.find({ teacher: course.teacher, deleted: false });
      const avg = remaining.length
        ? Math.round(
            (
              remaining.reduce(
                (sum, r) =>
                  sum +
                  ((r.ratings.communication + r.ratings.collaboration + r.ratings.ethics + r.ratings.responsibility + r.ratings.problemSolving) / 5),
                0
              ) /
              remaining.length
            ) * 10
          ) / 10
        : 0;
      await Teacher.findByIdAndUpdate(course.teacher, { avgRating: avg, totalReviews: remaining.length });
    }

    const populated = await Course.findById(course._id)
      .populate("institution")
      .populate("teacher", "name user")
      .populate("enrolledStudents", "name nim_nip");

    res.json({ success: true, message: "Course updated", data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    // Soft-delete course and clear enrolledStudents
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { deleted: true, enrolledStudents: [] },
      { new: true }
    );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Cascade: soft-delete all enrollments for this course
    await Enrollment.updateMany(
      { course: req.params.id, deleted: false },
      { $set: { deleted: true } }
    );

    // Cascade: soft-delete all reviews tied to this course
    await Review.updateMany(
      { course: req.params.id, deleted: false },
      { $set: { deleted: true } }
    );

    // Detach course from teacher list
    if (course.teacher) {
      await Teacher.findByIdAndUpdate(course.teacher, {
        $pull: { courses: course._id },
      });
    }

    res.json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

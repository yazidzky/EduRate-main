import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import StudentReview from "../models/StudentReview.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  const filter = { deleted: false };
  if (req.query.from) filter.from = req.query.from;
  if (req.query.to) filter.to = req.query.to;
  if (req.query.course) filter.course = req.query.course;
    if (req.query.meetingNumber) filter.meetingNumber = parseInt(req.query.meetingNumber);

    const reviewsRaw = await StudentReview.find(filter)
      .populate("from", "role")
      .populate("to", "name nim_nip")
      .populate("course", "name code")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const reviews = reviewsRaw.map((r) => ({
      ...r,
      from: r.from ? { _id: r.from._id || r.from, role: r.from.role, name: "Anonymous" } : undefined,
    }));
    const total = await StudentReview.countDocuments(filter);
    res.json({ success: true, data: reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/",
  authenticate,
  [
    body("to").notEmpty(),
    body("ratings.communication").optional().isFloat({ min: 1, max: 5 }),
    body("ratings.collaboration").optional().isFloat({ min: 1, max: 5 }),
    body("ratings.ethics").optional().isFloat({ min: 1, max: 5 }),
    body("ratings.responsibility").optional().isFloat({ min: 1, max: 5 }),
    body("ratings.problemSolving").optional().isFloat({ min: 1, max: 5 }),
    body("teacherRatings.communication").optional().isFloat({ min: 1, max: 5 }),
    body("teacherRatings.collaboration").optional().isFloat({ min: 1, max: 5 }),
    body("teacherRatings.ethics").optional().isFloat({ min: 1, max: 5 }),
    body("teacherRatings.responsibility").optional().isFloat({ min: 1, max: 5 }),
    body("teacherRatings.problemSolving").optional().isFloat({ min: 1, max: 5 }),
    body("meetingNumber").notEmpty().isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const { to, ratings, teacherRatings, comment, course } = req.body;
      const meetingNumber = parseInt(req.body.meetingNumber);
      const hasStudentRatings =
        ratings && (ratings.communication || ratings.collaboration || ratings.ethics || ratings.responsibility || ratings.problemSolving);
      const hasTeacherRatings = teacherRatings && (teacherRatings.communication || teacherRatings.collaboration || teacherRatings.ethics || teacherRatings.responsibility || teacherRatings.problemSolving);
      const ratingsClean = hasStudentRatings ? ratings : undefined;
      const teacherRatingsClean = hasTeacherRatings ? teacherRatings : undefined;
      const target = await User.findById(to).select("role deleted");
      if (!target || target.deleted || target.role !== "mahasiswa") {
        return res.status(404).json({ success: false, message: "Target mahasiswa tidak ditemukan" });
      }

      // Gate mahasiswa->mahasiswa ratings by course meeting configuration
      if (ratingsClean && req.role === "mahasiswa") {
        if (!course || !mongoose.Types.ObjectId.isValid(String(course))) {
          return res.status(400).json({ success: false, message: "Course diperlukan untuk rating teman" });
        }
        const c = await Course.findById(String(course)).select("meetings totalMeetings deleted");
        if (!c || c.deleted) {
          return res.status(404).json({ success: false, message: "Course tidak ditemukan" });
        }
        const meeting = (c.meetings || []).find((m) => Number(m.number) === Number(meetingNumber));
        if (!meeting || !meeting.ratingEnabled) {
          return res.status(400).json({ success: false, message: "Pertemuan belum dibuat atau belum diaktifkan" });
        }
        const now = Date.now();
        const start = meeting.startAt ? new Date(meeting.startAt).getTime() : undefined;
        const end = meeting.endAt ? new Date(meeting.endAt).getTime() : undefined;
        if (!start || !end) {
          return res.status(400).json({ success: false, message: "Waktu rating belum ditetapkan" });
        }
        if (now < start) {
          return res.status(400).json({ success: false, message: "Belum waktunya" });
        }
        if (now > end) {
          return res.status(400).json({ success: false, message: "Waktu rating sudah berakhir" });
        }
      }

      const findFilter = { from: req.userId, to, deleted: false, meetingNumber };
      let existing = await StudentReview.findOne(findFilter);
      if (existing) {
        if (ratingsClean) existing.ratings = ratingsClean;
        if (teacherRatingsClean) existing.teacherRatings = teacherRatingsClean;
        if (comment !== undefined) existing.comment = comment;
        if (course) existing.course = course;
        if (meetingNumber) existing.meetingNumber = meetingNumber;
        await existing.save();
        return res.json({ success: true, message: "Review diperbarui", data: existing });
      }

      if (!ratingsClean && !teacherRatingsClean) {
        return res.status(400).json({ success: false, message: "Ratings tidak boleh kosong" });
      }
      const review = new StudentReview({ from: req.userId, to, ratings: ratingsClean, teacherRatings: teacherRatingsClean, comment, course, meetingNumber });
      await review.save();
      res.status(201).json({ success: true, message: "Review dibuat", data: review });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.get("/summary", authenticate, async (req, res) => {
  try {
    const { user, to, fromRole, metrics, meetingNumber } = req.query;
    const match = { deleted: false };
    if (user && mongoose.Types.ObjectId.isValid(user)) match.from = new mongoose.Types.ObjectId(user);
    if (to && mongoose.Types.ObjectId.isValid(to)) match.to = new mongoose.Types.ObjectId(to);
    if (meetingNumber) {
      const mn = parseInt(meetingNumber);
      if (!isNaN(mn)) match.meetingNumber = mn;
    }

    const pipeline = [{ $match: match }];

    if (fromRole === "mahasiswa" || fromRole === "dosen" || fromRole === "admin") {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "from",
            foreignField: "_id",
            as: "fromDoc",
          },
        },
        { $unwind: "$fromDoc" },
        { $match: { "fromDoc.role": fromRole } }
      );
    }

    if (metrics === "teacher") {
      pipeline.push({
        $group: {
          _id: null,
          communication: { $avg: "$teacherRatings.communication" },
          collaboration: { $avg: "$teacherRatings.collaboration" },
          ethics: { $avg: "$teacherRatings.ethics" },
          responsibility: { $avg: "$teacherRatings.responsibility" },
          problemSolving: { $avg: "$teacherRatings.problemSolving" },
          count: { $sum: 1 },
        },
      });
      const result = await StudentReview.aggregate(pipeline);
      const data = result[0] || { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 };
      return res.json({ success: true, data });
    } else {
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
      const result = await StudentReview.aggregate(pipeline);
      const data =
        result[0] || { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 };
      return res.json({ success: true, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Per-meeting analysis for student reviews (target = to)
router.get("/analysis/:targetId", authenticate, async (req, res) => {
  try {
    const targetId = req.params.targetId;
    const course = req.query.course;
    const metrics = req.query.metrics; // "teacher" to use teacherRatings, otherwise ratings
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.json({ success: true, data: [] });
    }
    const match = { to: new mongoose.Types.ObjectId(targetId), deleted: false };
    if (course && mongoose.Types.ObjectId.isValid(String(course))) {
      match.course = new mongoose.Types.ObjectId(String(course));
    }
    const groupStage = {
      _id: "$meetingNumber",
      meetingNumber: { $first: "$meetingNumber" },
      count: { $sum: 1 },
    };
    if (metrics === "teacher") {
      groupStage.communication = { $avg: "$teacherRatings.communication" };
      groupStage.collaboration = { $avg: "$teacherRatings.collaboration" };
      groupStage.ethics = { $avg: "$teacherRatings.ethics" };
      groupStage.responsibility = { $avg: "$teacherRatings.responsibility" };
      groupStage.problemSolving = { $avg: "$teacherRatings.problemSolving" };
    } else {
      groupStage.communication = { $avg: "$ratings.communication" };
      groupStage.collaboration = { $avg: "$ratings.collaboration" };
      groupStage.ethics = { $avg: "$ratings.ethics" };
      groupStage.responsibility = { $avg: "$ratings.responsibility" };
      groupStage.problemSolving = { $avg: "$ratings.problemSolving" };
    }
    const pipeline = [{ $match: match }, { $group: groupStage }, { $sort: { meetingNumber: 1 } }];
    const results = await StudentReview.aggregate(pipeline);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

import express from "express";
import { body, validationResult } from "express-validator";
import Teacher from "../models/Teacher.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";
import Course from "../models/Course.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { deleted: false };
    if (req.query.user) filter.user = req.query.user;

    let teachers = await Teacher.find(filter)
      .populate("institution")
      .populate("courses")
      .populate("user", "name email department phone role")
      .skip(skip)
      .limit(limit);

    const missing = teachers.filter((t) => !t.user);
    if (missing.length > 0) {
      const User = (await import("../models/User.js")).default;
      const names = Array.from(new Set(missing.map((t) => String(t.name || "").trim()).filter(Boolean)));
      const users = await User.find({ role: "dosen", deleted: false, name: { $in: names } }).select("name email department phone role createdAt");
      const buckets = new Map();
      for (const u of users) {
        const key = String(u.name || "").trim().toLowerCase();
        const arr = buckets.get(key) || [];
        arr.push(u);
        buckets.set(key, arr);
      }
      teachers = teachers.map((t) => {
        if (t.user) return t;
        const key = String(t.name || "").trim().toLowerCase();
        const arr = buckets.get(key) || [];
        const u = arr.sort((a, b) => {
          const at = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return at - bt;
        })[0];
        if (!u) return t;
        const obj = t.toObject();
        obj.user = {
          name: u.name,
          email: u.email,
          department: u.department || obj.department || "",
          phone: u.phone || "",
          role: "dosen",
        };
        return obj;
      });
    }

    const total = await Teacher.countDocuments(filter);

    res.json({
      success: true,
      data: teachers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("institution")
      .populate("courses")
      .populate("user", "name email department phone role");

    if (!teacher || teacher.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      teacher: req.params.id,
      deleted: false,
    })
      .populate("user", "name avatar")
      .populate("course", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({
      teacher: req.params.id,
      deleted: false,
    });

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
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
    body("institution").notEmpty().withMessage("Institution is required"),
    body("department").notEmpty().withMessage("Department is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, institution, department, avatar, user } = req.body;
      let payload = { name, institution, department, avatar };
      if (user) payload = { ...payload, user };
      const teacher = new Teacher(payload);
      await teacher.save();

      res
        .status(201)
        .json({ success: true, message: "Teacher created", data: teacher });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.post(
  "/migrate-courses",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { targetTeacherId, sourceTeacherIds, userId } = req.body;
      if (!targetTeacherId || !mongoose.Types.ObjectId.isValid(targetTeacherId)) {
        return res.status(400).json({ success: false, message: "targetTeacherId invalid" });
      }
      const target = await Teacher.findById(targetTeacherId);
      if (!target || target.deleted) {
        return res.status(404).json({ success: false, message: "Target teacher not found" });
      }

      let sources = Array.isArray(sourceTeacherIds) ? sourceTeacherIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) : [];
      if (sources.length === 0 && userId && mongoose.Types.ObjectId.isValid(userId)) {
        const User = (await import("../models/User.js")).default;
        const userDoc = await User.findById(userId);
        if (userDoc) {
          const candidates = await Teacher.find({ name: userDoc.name, deleted: false }).select("_id");
          sources = candidates.map((c) => c._id.toString()).filter((id) => id !== targetTeacherId);
        }
      }

      if (sources.length === 0) {
        return res.status(400).json({ success: false, message: "No sourceTeacherIds to migrate" });
      }

      const updateResult = await Course.updateMany(
        { teacher: { $in: sources }, deleted: false },
        { $set: { teacher: targetTeacherId } }
      );

      const targetCourses = await Course.find({ teacher: targetTeacherId, deleted: false }).select("_id");
      await Teacher.findByIdAndUpdate(targetTeacherId, { courses: targetCourses.map((c) => c._id) });

      for (const sid of sources) {
        const sourceCourses = await Course.find({ teacher: sid, deleted: false }).select("_id");
        await Teacher.findByIdAndUpdate(sid, { courses: sourceCourses.map((c) => c._id) });
      }

      res.json({ success: true, message: "Courses migrated", data: { updated: updateResult?.modifiedCount || 0, targetTeacherId, sourceTeacherIds: sources } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, department, avatar, user } = req.body;
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, department, avatar, ...(user ? { user } : {}) },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    await Review.updateMany({ teacher: req.params.id, deleted: false }, { $set: { deleted: true } });
    await Teacher.findByIdAndUpdate(req.params.id, { avgRating: 0, totalReviews: 0 });

    res.json({ success: true, message: "Teacher updated", data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/sync-fields",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const teachers = await Teacher.find({ deleted: false }).populate(
        "user",
        "department"
      );
      let updated = 0;
      for (const t of teachers) {
        const tDept = (t?.department || "").trim();
        const uDept = (t?.user?.department || "").trim();
        if (!tDept && uDept) {
          await Teacher.findByIdAndUpdate(t._id, { department: uDept });
          updated++;
        }
      }
      res.json({ success: true, message: "Fields synchronized", data: { updated } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.post(
  "/link-users",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const TeacherModel = Teacher;
      const UserModel = (await import("../models/User.js")).default;
      const teachers = await TeacherModel.find({ deleted: false });
      let linked = 0;
      for (const t of teachers) {
        if (t.user) continue;
        const name = String(t?.name || "").trim();
        if (!name) continue;
        const candidates = await UserModel.find({ role: "dosen", deleted: false, name });
        if (candidates.length === 1) {
          const u = candidates[0];
          await TeacherModel.findByIdAndUpdate(t._id, { user: u._id, department: t.department || u.department || "" });
          linked++;
        }
      }
      res.json({ success: true, message: "Users linked to teachers", data: { linked } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Link or upsert teacher by user id
router.get("/by-user/:userId", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const teachers = await Teacher.find({ user: userId, deleted: false })
      .populate("institution")
      .populate("courses")
      .populate("user", "name email department phone role");
    if (teachers.length > 0) {
      return res.json({ success: true, data: teachers[0] });
    }
    // If not found, attempt to create teacher from user profile
    const User = (await import("../models/User.js")).default;
    const u = await User.findById(userId).populate("institution");
    if (!u || u.deleted || u.role !== "dosen") {
      return res.status(404).json({ success: false, message: "User dosen tidak ditemukan" });
    }
    const inst = u.institution?._id || u.institution;
    const t = new Teacher({
      name: u.name,
      ...(inst ? { institution: inst } : {}),
      department: u.department || "",
      user: u._id,
    });
    await t.save();
    const populated = await Teacher.findById(t._id)
      .populate("institution")
      .populate("courses")
      .populate("user", "name email department phone role");
    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    res.json({ success: true, message: "Teacher deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

// Migration endpoint: reassign reviews from source teachers to target teacher
// Admin only
router.post(
  "/migrate-reviews",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { targetTeacherId, sourceTeacherIds, userId } = req.body;
      if (!targetTeacherId || !mongoose.Types.ObjectId.isValid(targetTeacherId)) {
        return res.status(400).json({ success: false, message: "targetTeacherId invalid" });
      }

      const target = await Teacher.findById(targetTeacherId);
      if (!target || target.deleted) {
        return res.status(404).json({ success: false, message: "Target teacher not found" });
      }

      let sources = Array.isArray(sourceTeacherIds) ? sourceTeacherIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) : [];
      if (sources.length === 0 && userId && mongoose.Types.ObjectId.isValid(userId)) {
        const u = (await import("../models/User.js")).default;
        const userDoc = await u.findById(userId);
        if (userDoc) {
          const candidates = await Teacher.find({ name: userDoc.name, deleted: false }).select("_id");
          sources = candidates.map((c) => c._id.toString()).filter((id) => id !== targetTeacherId);
        }
      }

      if (sources.length === 0) {
        return res.status(400).json({ success: false, message: "No sourceTeacherIds to migrate" });
      }

      const updateResult = await Review.updateMany({ teacher: { $in: sources }, deleted: false }, { $set: { teacher: targetTeacherId } });

      const agg = await Review.aggregate([
        { $match: { teacher: new mongoose.Types.ObjectId(targetTeacherId), deleted: false } },
        {
          $group: {
            _id: "$teacher",
            avgCommunication: { $avg: "$ratings.communication" },
            avgCollaboration: { $avg: "$ratings.collaboration" },
            avgEthics: { $avg: "$ratings.ethics" },
            avgResponsibility: { $avg: "$ratings.responsibility" },
            avgProblemSolving: { $avg: "$ratings.problemSolving" },
            count: { $sum: 1 },
          },
        },
      ]);
      const stats = agg[0] || { avgCommunication: 0, avgCollaboration: 0, avgEthics: 0, avgResponsibility: 0, avgProblemSolving: 0, count: 0 };
      const overall = stats.count
        ? Math.round(((stats.avgCommunication + stats.avgCollaboration + stats.avgEthics + stats.avgResponsibility + stats.avgProblemSolving) / 5) * 10) / 10
        : 0;
      await Teacher.findByIdAndUpdate(targetTeacherId, { avgRating: overall, totalReviews: stats.count });

      for (const sid of sources) {
        const sAgg = await Review.aggregate([
          { $match: { teacher: new mongoose.Types.ObjectId(sid), deleted: false } },
          {
            $group: {
              _id: "$teacher",
              avgCommunication: { $avg: "$ratings.communication" },
              avgCollaboration: { $avg: "$ratings.collaboration" },
              avgEthics: { $avg: "$ratings.ethics" },
              avgResponsibility: { $avg: "$ratings.responsibility" },
              avgProblemSolving: { $avg: "$ratings.problemSolving" },
              count: { $sum: 1 },
            },
          },
        ]);
        const sStats = sAgg[0] || { avgCommunication: 0, avgCollaboration: 0, avgEthics: 0, avgResponsibility: 0, avgProblemSolving: 0, count: 0 };
        const sOverall = sStats.count
          ? Math.round(((sStats.avgCommunication + sStats.avgCollaboration + sStats.avgEthics + sStats.avgResponsibility + sStats.avgProblemSolving) / 5) * 10) / 10
          : 0;
        await Teacher.findByIdAndUpdate(sid, { avgRating: sOverall, totalReviews: sStats.count });
      }

      res.json({ success: true, message: "Reviews migrated", data: { updated: updateResult?.modifiedCount || 0, targetTeacherId, sourceTeacherIds: sources } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

import express from "express";
import User from "../models/User.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// List all admins (admin-only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = { deleted: false, role: "admin" };

    const admins = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Exclude current admin from list
    const filtered = admins.filter((u) => u._id.toString() !== req.userId);

    const total = await User.countDocuments(filter);
    res.json({
      success: true,
      data: filtered,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
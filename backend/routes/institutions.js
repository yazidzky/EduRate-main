import express from "express";
import { body, validationResult, query } from "express-validator";
import Institution from "../models/Institution.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const institutions = await Institution.find({ deleted: false })
      .skip(skip)
      .limit(limit);

    const total = await Institution.countDocuments({ deleted: false });

    res.json({
      success: true,
      data: institutions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution || institution.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Institution not found" });
    }

    res.json({ success: true, data: institution });
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
    body("type")
      .isIn(["university", "college", "school", "institute"])
      .withMessage("Invalid type"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, type, location, description, logo } = req.body;
      const institution = new Institution({
        name,
        type,
        location,
        description,
        logo,
      });
      await institution.save();

      res
        .status(201)
        .json({
          success: true,
          message: "Institution created",
          data: institution,
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, type, location, description, logo } = req.body;
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { name, type, location, description, logo },
      { new: true, runValidators: true }
    );

    if (!institution) {
      return res
        .status(404)
        .json({ success: false, message: "Institution not found" });
    }

    res.json({
      success: true,
      message: "Institution updated",
      data: institution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!institution) {
      return res
        .status(404)
        .json({ success: false, message: "Institution not found" });
    }

    res.json({ success: true, message: "Institution deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

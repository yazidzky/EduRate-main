import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import teacherRoutes from "./routes/teachers.js";
import courseRoutes from "./routes/courses.js";
import institutionRoutes from "./routes/institutions.js";
import reviewRoutes from "./routes/reviews.js";
import studentReviewsRoutes from "./routes/studentReviews.js";
import statsRoutes from "./routes/stats.js";
import enrollmentRoutes from "./routes/enrollments.js";
import userRoutes from "./routes/users.js";
import adminsRoutes from "./routes/admins.js";
import adminReviewsRoutes from "./routes/adminReviews.js";
import Enrollment from "./models/Enrollment.js";
import StudentReview from "./models/StudentReview.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Ensure indexes are up to date and drop legacy duplicate index
(async () => {
  try {
    const indexes = await Enrollment.collection.indexes();
    const legacy = indexes.find((ix) => ix.name === "user_1_course_1");
    if (legacy) {
      try {
        await Enrollment.collection.dropIndex("user_1_course_1");
      } catch (e) {
        // ignore if drop fails
      }
    }
    await Enrollment.syncIndexes();

    try {
      const srIndexes = await StudentReview.collection.indexes();
      const legacySr = srIndexes.find((ix) => ix.name === "uniq_student_from_to_active");
      if (legacySr) {
        try {
          await StudentReview.collection.dropIndex("uniq_student_from_to_active");
        } catch (e) {
          // ignore if drop fails
        }
      }
      await StudentReview.syncIndexes();
    } catch (e) {
      // ignore student review index sync errors
    }
  } catch (e) {
    // ignore index sync errors to avoid blocking server start
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/student-reviews", studentReviewsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/admin-reviews", adminReviewsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// Serve built frontend if available
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "../frontend/dist");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
} catch {}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped"],
      default: "active",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique only for active enrollments (deleted: false)
enrollmentSchema.index(
  { user: 1, course: 1 },
  { unique: true, partialFilterExpression: { deleted: false }, name: "uniq_user_course_active" }
);

export default mongoose.model("Enrollment", enrollmentSchema);

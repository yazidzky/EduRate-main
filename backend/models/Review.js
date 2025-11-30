import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ratings: {
      communication: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      collaboration: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      ethics: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      responsibility: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      problemSolving: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
  },
    comment: String,
    helpful: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { user: 1, teacher: 1 },
  { unique: true, partialFilterExpression: { deleted: false }, name: "uniq_user_teacher_active" }
);

export default mongoose.model("Review", reviewSchema);

import mongoose from "mongoose";

const studentReviewSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  ratings: {
    communication: { type: Number, min: 1, max: 5 },
    collaboration: { type: Number, min: 1, max: 5 },
    ethics: { type: Number, min: 1, max: 5 },
    responsibility: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
  },
  teacherRatings: {
    communication: { type: Number, min: 1, max: 5 },
    collaboration: { type: Number, min: 1, max: 5 },
    ethics: { type: Number, min: 1, max: 5 },
    responsibility: { type: Number, min: 1, max: 5 },
    problemSolving: { type: Number, min: 1, max: 5 },
  },
    comment: { type: String },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

studentReviewSchema.index(
  { from: 1, to: 1 },
  { unique: true, partialFilterExpression: { deleted: false }, name: "uniq_student_from_to_active" }
);

export default mongoose.model("StudentReview", studentReviewSchema);

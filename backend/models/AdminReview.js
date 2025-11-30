import mongoose from "mongoose";

const adminReviewSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratings: {
      communication: { type: Number, min: 1, max: 5, required: true },
      collaboration: { type: Number, min: 1, max: 5, required: true },
      ethics: { type: Number, min: 1, max: 5, required: true },
      responsibility: { type: Number, min: 1, max: 5, required: true },
      problemSolving: { type: Number, min: 1, max: 5, required: true },
    },
    comment: { type: String },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

adminReviewSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.model("AdminReview", adminReviewSchema);

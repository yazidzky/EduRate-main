import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    department: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    schedule: {
      type: String,
      default: "",
    },
    room: {
      type: String,
      default: "",
    },
    semester: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalMeetings: {
      type: Number,
      default: 12,
      min: 1,
    },
    meetings: [
      {
        number: { type: Number, min: 1 },
        date: { type: Date },
        startAt: { type: Date },
        endAt: { type: Date },
        ratingEnabled: { type: Boolean, default: false },
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: String,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

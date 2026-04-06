import mongoose from "mongoose";

const subLectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  videoUrl: { type: String },
  publicId: { type: String },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("SubLecture", subLectureSchema);

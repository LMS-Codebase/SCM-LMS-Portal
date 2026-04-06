import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
    },
    videoUrl: { type: String },
    publicId: { type: String },
    pdfUrl: { type: String },
    pdfPublicId: { type: String },
    isPreviewFree: { type: Boolean },
    subLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubLecture",
      },
    ],
  },
  { timestamps: true },
);

export const Lecture = mongoose.model("Lecture", lectureSchema);

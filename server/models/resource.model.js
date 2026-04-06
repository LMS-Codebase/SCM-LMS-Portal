import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    url: String,
    public_id: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
  type: String,
  required: true,
  enum: ["case-study", "ebook", "blog", "course"], // add more as needed
},
}, { timestamps: true });

export default mongoose.model("Resource", resourceSchema);
import mongoose from "mongoose";

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    public_id: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export default mongoose.model("Domain", domainSchema);
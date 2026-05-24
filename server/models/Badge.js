import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "", trim: true },
  iconUrl: { type: String, default: "" },
  type: { type: String, enum: ["badge", "role"], default: "badge" },
  criteria: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
});


const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:     String,
  email:    { type: String, unique: true },
  phone:    { type: String, default: "" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });  // gives createdAt, updatedAt automatically

export default mongoose.model("User", userSchema);
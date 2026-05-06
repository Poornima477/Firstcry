import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name:       { type: String },
  email:      { type: String, unique: true },
  password:   { type: String },
  otp:        { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  phone:      { type: String, default: "" },      // ← add this
  isActive:   { type: Boolean, default: true },   // ← add this
}, { timestamps: true });                          // ← add this

export default mongoose.model("Customer", customerSchema);
import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  otp:        { type: String, default: null },
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model("Customer", CustomerSchema);
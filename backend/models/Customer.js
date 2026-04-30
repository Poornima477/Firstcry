// models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: Number, default: null },           
  isVerified: { type: Boolean, default: false }  
});

const CustomerModel = mongoose.model("Customer", customerSchema);
export default CustomerModel;
// models/Order.js — make sure these fields exist
const orderSchema = new mongoose.Schema({
  fullName:      String,
  phone:         String,
  email:         String,   // ← this is what we search by
  address:       String,
  city:          String,
  state:         String,
  pincode:       String,
  items:         Array,
  total:         Number,
  payment:       String,
  orderStatus:   { type: String, default: "Placed" },
  paymentStatus: { type: String, default: "Pending" },
}, { timestamps: true });   // ← timestamps gives createdAt automatically

export default mongoose.model("Order", orderSchema);
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  quantity: {        // ✅ also fixing typo
    type: Number,
    default: 1
  }
});

export default mongoose.model("Cart", cartSchema);
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email:String,
  address: String,
  city: String,
  state: String,
  pincode: String,

  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],

  total: Number,

  payment: String,
  paymentStatus: String,
  orderStatus: String
}, { timestamps: true });

const OrderModel = mongoose.model("Order",OrderSchema)
export default OrderModel;
 

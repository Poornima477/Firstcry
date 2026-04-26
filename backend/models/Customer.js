import mongoose  from "mongoose";

const CustomerSchema = new mongoose.Schema({
  //name: String,
  //email: String,
  //password: String

  name:{type:String, required:true},
  email:{type:String,required:true, unique:true},
  password:{type:String,required:true},
  verifyOtp:{type:String,default:''},
  verifyOtpExpireAt:{type:Number,default:0},
  isAccountVErified: {type:Boolean,default:false},
  resetOtp: {type:String, default:''},
  resetOtpExpireAt: {type:Number, default:0},
})

const CustomerModel = mongoose.models.user ||mongoose.model("Customer", CustomerSchema)

export default CustomerModel;
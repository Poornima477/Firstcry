import mongoose  from "mongoose";


const ProductSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },
  image: {
    type:String,
  },

  description: {
    type: String,
    required: true
  },

  price:{
    type:Number,
    required:true
  },
  quantity:{
    type:Number,
    required:true
  }
})
  
const ProductModel = mongoose.model("Product", ProductSchema)

export default ProductModel;
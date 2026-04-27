import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";


import CustomerModel from "./models/Customer.js";
import ProductModel from "./models/Product.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-netlify-app-name.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.log("MongoDB Error ", err));


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

console.log("EMAIL:", process.env.SENDGRID_EMAIL);
console.log("PASS:", process.env.SENDGRID_API_KEY);


const transporter = nodemailer.createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey", 
    pass: process.env.SENDGRID_API_KEY
  }
});


app.post("/sendVerifyOtp", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("STEP 1: Request received ->", email);

    // ✅ Check email
    if (!email) {
      console.log("STEP 2: Email missing");
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    // ✅ Find user
    const user = await CustomerModel.findOne({ email });
    console.log("STEP 3: User found ->", user);

    if (!user) {
      console.log("STEP 3 FAILED: User not found");
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("STEP 4: OTP generated ->", otp);

    // ✅ Save OTP
    user.otp = otp;
    await user.save();
    console.log("STEP 5: OTP saved to DB");

    // ✅ Send Email
    const info = await transporter.sendMail({
      from: "poornimasg03@gmail.com", // 🔴 must match your email config
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`
    });

    console.log("STEP 6: Mail sent successfully ->", info.response || info);

    // ✅ Final response
    res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (err) {
    console.log("🔥 OTP ERROR FULL:", err);
    console.log("🔥 ERROR MESSAGE:", err.message);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


app.get("/testmail", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SENDGRID_EMAIL,
      to: process.env.SENDGRID_EMAIL,
      subject: "Test",
      text: "Working!"
    });
    res.json({ success: true });
  } catch (err) {
    // This will show the EXACT error
    res.json({ success: false, error: err.message });
  }
});


app.post("/verifyOtp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await CustomerModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp == otp) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

app.get("/test", (req, res) => {
  console.log("TEST API HIT");
  res.send("Working");
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});



app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await CustomerModel.findOne({ email });
    if (existing) return res.json({ success: false, message: "Email exists" });

    const user = new CustomerModel({ name, email, password });
    await user.save();

    res.json({ success: true, message: "Registered" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});



app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await CustomerModel.findOne({ email });

  if (!user) return res.json("No user");
  if (user.password !== password) return res.json("Wrong password");

  res.json("Login successful");
});

app.post("/add-product", upload.single("image"), async (req, res) => {
  try {

    console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Key:", process.env.CLOUDINARY_API_KEY);
console.log("FILE:", req.file);
   
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const product = new ProductModel({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      image: result.secure_url
    });

    await product.save();

    res.json({ message: "Product Added Successfully", product });

  } catch (err) {
    console.log("ERROR:", err); 
    res.status(500).json({ message: "Error adding product" });
  }
});

app.get("/product", async (req, res) => {
  const data = await ProductModel.find();
  res.json(data);
});


app.delete("/delete-product/:id", async (req, res) => {
  await ProductModel.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});


app.post("/cart", async (req, res) => {
  const { name, price, image } = req.body;

  const existing = await Cart.findOne({ name });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
    return res.json(existing);
  }

  const item = new Cart({ name, price, image, quantity: 1 });
  await item.save();

  res.json(item);
});

app.get("/cart", async (req, res) => {
  res.json(await Cart.find());
});


app.post("/place-order", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});

app.get("/order", async (req, res) => {
  res.json(await Order.find());
});



app.post("/create-razorpay-order", async (req, res) => {
  const order = await razorpay.orders.create({
    amount: req.body.amount * 100,
    currency: "INR"
  });

  res.json(order);
});

app.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expected === razorpay_signature) {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "Paid"
    });
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

app.put("/update-user/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

app.delete("/delete-user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend Running ");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
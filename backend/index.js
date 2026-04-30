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

// ✅ CORS — allow both local dev and Netlify
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://prismatic-kitsune-4101f6.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.log("MongoDB Error:", err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ SendGrid via SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY
  }
});

// ✅ Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await CustomerModel.findOne({ email });
    if (existing) return res.json({ success: false, message: "Email already exists" });

    const user = new CustomerModel({ name, email, password });
    await user.save();

    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

// ✅ Send OTP
app.post("/sendVerifyOtp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const user = await CustomerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please register first." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);

    user.otp = otp;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDGRID_EMAIL,
      to: email,
      subject: "OTP Verification - FirstCry",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #eee;border-radius:10px;">
          <h2 style="color:#e91e63;">FirstCry - Email Verification</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your OTP for email verification is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#e91e63;text-align:center;padding:20px 0;">
            ${otp}
          </div>
          <p style="color:#888;font-size:13px;">Valid for 10 minutes. Do not share with anyone.</p>
        </div>
      `
    });

    console.log("OTP email sent to:", email);
    res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error("sendVerifyOtp error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Verify OTP
app.post("/verifyOtp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const user = await CustomerModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("DB OTP:", user.otp, "| Entered:", otp);

    if (String(user.otp) === String(otp.trim())) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      res.json({ success: true, message: "Email verified successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

  } catch (err) {
    console.error("verifyOtp error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await CustomerModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "No user found" });
    if (user.password !== password) return res.json({ success: false, message: "Wrong password" });
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/test", (req, res) => res.send("Server working!"));

app.get("/testmail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.SENDGRID_EMAIL,
      to: process.env.SENDGRID_EMAIL,
      subject: "Test Mail",
      text: "SendGrid is working!"
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existing = await CustomerModel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Email already exists. Please login." });
    }

    const user = new CustomerModel({ name, email, password });
    await user.save();

    console.log("User registered:", email);
    res.json({ success: true, message: "Registered successfully" });

  } catch (err) {
    console.error("Register error:", err.message);
    // This catches MongoDB duplicate key error too
    if (err.code === 11000) {
      return res.json({ success: false, message: "Email already exists. Please login." });
    }
    res.status(500).json({ success: false, message: "Registration failed: " + err.message });
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
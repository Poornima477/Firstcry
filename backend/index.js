import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import sgMail from "@sendgrid/mail";
import Razorpay from "razorpay";
import crypto from "crypto";

import CustomerModel from "./models/Customer.js";
import ProductModel from "./models/Product.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import UserModel from "./models/User.js";
import { generateInvoicePDF, sendInvoiceEmail } from "./components/generateInvoice.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin:         "*",
  methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.log("MongoDB Error:", err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload  = multer({ storage });

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get("/check-keys", (req, res) => {
  res.json({
    key_id:     process.env.RAZORPAY_KEY_ID     || "MISSING",
    key_secret: process.env.RAZORPAY_KEY_SECRET  ? "Secret exists" : "MISSING"
  });
});

app.get("/test-email", async (req, res) => {
  try {
    await sgMail.send({
      from:    process.env.SENDGRID_EMAIL,
      to:      process.env.SENDGRID_EMAIL,
      subject: "Test - SendGrid HTTP API",
      text:    "SendGrid HTTP API is working!"
    });
    res.json({ success: true, message: "Email sent!" });
  } catch (err) {
    console.error("TEST EMAIL ERROR:", err.message);
    res.json({ success: false, error: err.message, details: err?.response?.body });
  }
});


app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    let user = await CustomerModel.findOne({ email });
    if (user && user.isVerified)
      return res.json({ success: false, message: "Email already registered. Please login." });

    if (!user) {
      user = new CustomerModel({ name, email, password });
      await user.save();
    }
    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    if (err.code === 11000)
      return res.json({ success: false, message: "Email already exists. Please login." });
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.post("/sendVerifyOtp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await CustomerModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found. Please register first." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp  = otp;
    await user.save();

    await sgMail.send({
      from:    process.env.SENDGRID_EMAIL,
      to:      email,
      subject: "OTP Verification - FirstCry",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;
                    padding:30px;border:1px solid #eee;border-radius:10px;">
          <h2 style="color:#e91e63;">FirstCry - Email Verification</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your OTP for email verification is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:10px;
                      color:#e91e63;text-align:center;padding:20px 0;">${otp}</div>
          <p style="color:#888;font-size:13px;">Valid for 10 minutes. Do not share with anyone.</p>
        </div>
      `
    });
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("sendVerifyOtp error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/verifyOtp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP required" });

    const user = await CustomerModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (String(user.otp) === String(otp.trim())) {
      user.isVerified = true;
      user.otp        = null;
      await user.save();
      res.json({ success: true, message: "Email verified! Registration complete." });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }
  } catch (err) {
    console.error("verifyOtp error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await CustomerModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "No account found. Please register first." });
    if (!user.isVerified)
      return res.json({ success: false, message: "Email not verified. Please complete OTP verification." });
    if (user.password !== password)
      return res.json({ success: false, message: "Wrong password. Please try again." });

    res.json({ success: true, message: "Login successful", user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
      return res.json({ success: true, message: "Admin login successful" });
    res.json({ success: false, message: "Invalid admin credentials" });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.get("/users", async (req, res) => {
  try {
    const users = await CustomerModel.find().sort({ createdAt: -1 });
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ email: user.email });
        return {
          _id:         user._id,
          name:        user.name,
          email:       user.email,
          phone:       user.phone || "—",
          isActive:    user.isActive !== false,
          joinedOn:    user.createdAt,
          lastActive:  user.updatedAt,
          totalOrders: orderCount,
        };
      })
    );
    res.json({ success: true, users: usersWithOrders });
  } catch (err) {
    console.log("users error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/users/block/:id", async (req, res) => {
  try {
    const user    = await CustomerModel.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/users/delete/:id", async (req, res) => {
  try {
    await CustomerModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



app.post("/add-product", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => { if (error) reject(error); else resolve(result); }
      ).end(req.file.buffer);
    });

    const product = new ProductModel({
      name:        req.body.name,
      category:    req.body.category,
      description: req.body.description,
      price:       req.body.price,
      quantity:    req.body.quantity,
      image:       result.secure_url
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

app.get("/product/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

app.put("/updateproduct/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name:        req.body.name,
      category:    req.body.category,
      description: req.body.description,
      price:       req.body.price,
      quantity:    req.body.quantity,
    };
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => { if (error) reject(error); else resolve(result); }
        ).end(req.file.buffer);
      });
      updateData.image = result.secure_url;
    }
    const updated = await ProductModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product Updated Successfully", product: updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating product" });
  }
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

app.put("/cart/:id", async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating cart" });
  }
});

app.delete("/cart/:id", async (req, res) => {
  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: "Removed from cart" });
});



app.post("/place-order", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json(order);
});

app.get("/order", async (req, res) => {
  res.json(await Order.find());
});


app.put("/update-payment/:orderId", async (req, res) => {
  try {
    const { paymentMethod, status } = req.body;

    // Update order in DB
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        paymentStatus: status === "paid" ? "Paid" : "Pending",
        payment:       paymentMethod || "cod",
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order placed! Invoice will be sent to " + order.email,
    });

  
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      await sendInvoiceEmail(order, pdfBuffer);
      console.log("Invoice sent to:", order.email);
    } catch (invoiceErr) {
      console.log("Invoice email failed (order still placed):", invoiceErr.message);
    }

  } catch (err) {
    console.log("update-payment error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


app.post("/create-razorpay-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount:   req.body.amount * 100,
      currency: "INR"
    });
    res.json(order);
  } catch (err) {
    console.log("create-razorpay-order error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

   
    const sign    = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid signature" });
    }

   
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        payment:       "online",
        paymentId:     razorpay_payment_id, 
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Payment verified!" });

    try {
      const pdfBuffer = await generateInvoicePDF(order);
      await sendInvoiceEmail(order, pdfBuffer);
      console.log("Invoice sent to:", order.email);
    } catch (invoiceErr) {
      console.log("Invoice email failed (payment still success):", invoiceErr.message);
    }

  } catch (err) {
    console.log("verify-payment error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});



app.get("/my-orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.log("my-orders error:", err.message);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.get("/admin/recent-orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }).limit(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recent orders" });
  }
});

app.get("/admin/stats", async (req, res) => {
  try {
    const products = await ProductModel.find();
    const orders   = await Order.find();
    const users    = await UserModel.find();
    res.json({
      totalProducts: products.length,
      totalOrders:   orders.length,
      totalUsers:    users.length,
      totalRevenue:  orders.reduce((sum, o) => sum + (o.total || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
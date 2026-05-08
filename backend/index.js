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
import PDFDocument from "pdfkit";

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
    key_id:     process.env.RAZORPAY_KEY_ID    || "MISSING",
    key_secret: process.env.RAZORPAY_KEY_SECRET ? "Secret exists" : "MISSING"
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
    res.status(500).json({ message: "Error adding product" });
  }
});

app.get("/product", async (req, res) => {
  res.json(await ProductModel.find());
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
      name: req.body.name, category: req.body.category,
      description: req.body.description, price: req.body.price, quantity: req.body.quantity,
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
  if (existing) { existing.quantity += 1; await existing.save(); return res.json(existing); }
  const item = new Cart({ name, price, image, quantity: 1 });
  await item.save();
  res.json(item);
});

app.get("/cart",        async (req, res) => { res.json(await Cart.find()); });
app.delete("/cart/:id", async (req, res) => { await Cart.findByIdAndDelete(req.params.id); res.json({ message: "Removed from cart" }); });

app.put("/cart/:id", async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(req.params.id, { quantity: req.body.quantity }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating cart" });
  }
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
    const { paymentMethod, status, paymentId } = req.body;

    const updateFields = {
      payment:       paymentMethod || "cod",
      paymentStatus: status === "paid" ? "Paid" : "Pending",
    };

    if (paymentId) updateFields.paymentId = paymentId;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateFields,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    
    res.json({ success: true, message: "Payment updated successfully" });

   
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      await sendInvoiceEmail(order, pdfBuffer);
      console.log("GST Invoice sent to:", order.email);
    } catch (invoiceErr) {
      console.log("Invoice failed:", invoiceErr.message);
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

    const sign     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.json({ success: false, message: "Invalid signature" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "Paid", payment: "online", paymentId: razorpay_payment_id },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Payment verified!" });

    try {
      const pdfBuffer = await generateInvoicePDF(order);
      await sendInvoiceEmail(order, pdfBuffer);
      console.log("Invoice sent to:", order.email);
    } catch (invoiceErr) {
      console.log("Invoice email failed:", invoiceErr.message);
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.get("/my-orders/:email", async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
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


export function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", chunk => buffers.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const pageWidth = 595;
    const margin    = 50;

    
    doc.fontSize(28).fillColor("#e91e63").font("Helvetica-Bold")
      .text("FirstCry", margin, 45);
    doc.fontSize(9).fillColor("#555").font("Helvetica")
      .text("Online Baby & Kids Store", margin, 78);

    const rightX = 340;
    doc.fontSize(9).fillColor("#333").font("Helvetica-Bold")
      .text("Corporate Office:", rightX, 45);
    doc.font("Helvetica").fillColor("#555")
      .text("FirstCry, 4th Floor, Wework Prestige Central,", rightX, 57)
      .text("36, Infantry Road, Bangalore - 560001",         rightX, 69)
      .text("GSTIN: 27AAJCB2616N1ZK",                       rightX, 81)
      .text("Support: support@firstcry.com",                 rightX, 93)
      .text("Phone: +91 9090909090",                         rightX, 105);

   
    doc.y = 130;
    doc.fontSize(14).fillColor("#000").font("Helvetica-Bold")
      .text("OFFICIAL RECEIPT", margin, doc.y);
    doc.moveTo(margin, doc.y + 18).lineTo(pageWidth - margin, doc.y + 18)
      .lineWidth(1).strokeColor("#ccc").stroke();
    doc.moveDown(1.8);

   
    const col1  = margin;
    const col2  = 320;
    const infoY = doc.y;

    doc.fontSize(9).font("Helvetica-Bold").fillColor("#333")
      .text("Invoice #:",  col1, infoY)
      .text("Order ID:",   col1, infoY + 14)
      .text("Date:",       col1, infoY + 28)
      .text("Payment:",    col1, infoY + 42)
      .text("Status:",     col1, infoY + 56);

    doc.font("Helvetica").fillColor("#555")
      .text(`INV-${String(order._id).slice(-6).toUpperCase()}`,  col1 + 58, infoY)
      .text(String(order._id),                                    col1 + 58, infoY + 14)
      .text(new Date(order.createdAt).toLocaleDateString("en-IN"),col1 + 58, infoY + 28)
      .text(order.payment === "cod" ? "COD" : "Online",           col1 + 58, infoY + 42)
      .text(order.orderStatus,                                     col1 + 58, infoY + 56);

    doc.fontSize(9).font("Helvetica-Bold").fillColor("#333")
      .text("Billed To:", col2, infoY);
    doc.font("Helvetica").fillColor("#555")
      .text(order.fullName, col2, infoY + 14)
      .text(order.email,    col2, infoY + 26)
      .text(order.phone,    col2, infoY + 38)
      .text(`${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
            col2, infoY + 50, { width: 210 });

    doc.y = infoY + 110;


    const tableTop   = doc.y;
    const colItem    = margin;
    const colQty     = 255;
    const colBase    = 305;
    const colCGST    = 365;
    const colSGST    = 420;
    const colTotal   = 475;
    const tableRight = pageWidth - margin;

    doc.rect(margin, tableTop, tableRight - margin, 22).fill("#f0f0f0");
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#333")
      .text("Item",    colItem + 3, tableTop + 6, { width: 245 })
      .text("Qty",     colQty,      tableTop + 6)
      .text("Base",    colBase,     tableTop + 6)
      .text("CGST",    colCGST,     tableTop + 6)
      .text("SGST",    colSGST,     tableTop + 6)
      .text("Total",   colTotal,    tableTop + 6);

    doc.moveTo(margin, tableTop + 22).lineTo(tableRight, tableTop + 22)
      .lineWidth(0.5).strokeColor("#ccc").stroke();

    let rowY = tableTop + 30;
    let taxableSubtotal = 0;
    let totalCGST = 0;

    order.items.forEach((item, i) => {
      const qty      = item.quantity || 1;
      const price    = item.price    || 0;
      const total    = price * qty;
      const base     = Math.round((total / 1.18) * 100) / 100;
      const cgst     = Math.round(((total - base) / 2) * 100) / 100;

      taxableSubtotal += base;
      totalCGST       += cgst;

      if (i % 2 === 0) doc.rect(margin, rowY - 4, tableRight - margin, 22).fill("#fafafa");

      doc.fontSize(8).font("Helvetica").fillColor("#333")
        .text(item.name,              colItem + 3, rowY, { width: 245 })
        .text(String(qty),            colQty,      rowY)
        .text(base.toFixed(2),        colBase,     rowY)
        .text(cgst.toFixed(2),        colCGST,     rowY)
        .text(cgst.toFixed(2),        colSGST,     rowY)
        .text(total.toFixed(2),       colTotal,    rowY);

      doc.moveTo(margin, rowY + 18).lineTo(tableRight, rowY + 18)
        .lineWidth(0.3).strokeColor("#eee").stroke();

      rowY += 24;
    });

    rowY += 12;
    doc.moveTo(margin, rowY).lineTo(tableRight, rowY)
      .lineWidth(0.5).strokeColor("#ccc").stroke();
    rowY += 10;

    const totalTax = totalCGST * 2;
    const labelX   = 360;
    const valueX   = 475;

    doc.fontSize(9).font("Helvetica").fillColor("#555")
      .text("Taxable Subtotal:",     labelX, rowY)
      .text(taxableSubtotal.toFixed(2), valueX, rowY)
      .text("Total Tax (GST 18%):",  labelX, rowY + 14)
      .text(totalTax.toFixed(2),     valueX, rowY + 14)
      .text("Shipping:",             labelX, rowY + 28)
      .text("FREE",                  valueX, rowY + 28);

    rowY += 48;
    doc.rect(labelX - 5, rowY - 4, tableRight - labelX + 5, 22).fill("#e91e63");
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#fff")
      .text("Grand Total:",          labelX,  rowY + 3)
      .text(order.total.toFixed(2),  valueX,  rowY + 3);


    rowY += 45;
    doc.moveTo(margin, rowY).lineTo(tableRight, rowY)
      .lineWidth(0.5).strokeColor("#ccc").stroke();
    doc.fontSize(9).font("Helvetica").fillColor("#888")
      .text("Thank you for shopping with FirstCry!", margin, rowY + 10,
            { align: "center", width: tableRight - margin })
      .text("This is a computer-generated invoice. No signature required.",
            margin, rowY + 22, { align: "center", width: tableRight - margin });

    doc.end();
  });
}


export async function sendInvoiceEmail(order, pdfBuffer) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    from:    process.env.SENDGRID_EMAIL,
    to:      order.email,
    subject: `GST Invoice - Order #${String(order._id).slice(-6).toUpperCase()} - FirstCry`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;">
        <h2 style="color:#e91e63;">FirstCry - Order Confirmed!</h2>
        <p>Dear <strong>${order.fullName}</strong>,</p>
        <p>Thank you for shopping with FirstCry!</p>
        <p>Your GST invoice is attached for Order
           <strong>#${String(order._id).slice(-6).toUpperCase()}</strong>.</p>
        <p>Grand Total: <strong>₹${order.total}</strong></p>
        <p>Payment: <strong>${order.payment === "cod" ? "Cash on Delivery" : "Online"}</strong></p>
        <br/>
        <p style="color:#888;font-size:12px;">Team FirstCry</p>
      </div>
    `,
    attachments: [{
      filename:    `FirstCry_Invoice_${String(order._id).slice(-6).toUpperCase()}.pdf`,
      content:     pdfBuffer.toString("base64"),
      type:        "application/pdf",
      disposition: "attachment"
    }]
  });
}

app.get("/", (req, res) => res.send("Backend Running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
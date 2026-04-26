import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomerModel from "../models/Customer.js";
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingCustomer = await CustomerModel.findOne({ email });

    if (existingCustomer) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new CustomerModel({
      name,
      email,
      password: hashedPassword,
    });

    await customer.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject:'Welcom to Firstcry',
      text:`Your accout is created `
    }

    await transporter.sendMail(mailOptions)

    return res.json({ success: true, message: "User registered successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};



export const login = async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {

    const user = await CustomerModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token
    });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {

    const { email } = req.body;

    const customer = await CustomerModel.findOne({email});

    if (!customer) {
      return res.json({ success: false, message: "User not found" });
    }

    if (customer.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    customer.verifyOtp = otp;
    customer.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await customer.save();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customer.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}`
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Verification OTP sent to email"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
};
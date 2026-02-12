const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cart = require("../models/cart");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");
const Joi = require("joi");
const rateLimit = require("express-rate-limit");

// Get all users
router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone role isBanned lastLoginAt createdAt")
      .lean();
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 signups per IP per 15 minutes
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per IP per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

// Validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).max(15).required(),
  password: Joi.string().min(8).max(64).required(),
});

// Create a new user (Signup)
router.post("/register", registerLimiter, async (req, res) => {
  try {
    // Validate input
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    let { name, email, phone, password } = req.body;

    // Normalize email
    email = email.toLowerCase().trim();

    // Check existing user
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
    });

    // Remove password from response
    const { password: _, ...safeUser } = newUser.toObject();

    res.status(201).json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// Login user
router.post("/login-user", loginLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select("+password");

    // Prevent user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Account is banned",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create cart if missing (before response)
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      await Cart.create({ user: user._id, items: [] });
    }

    // Track login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});
router.get("/userdata", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Account is banned",
      });
    }

    // Remove sensitive fields
    delete user.password;

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Userdata error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
});

//Admin user deletion
router.delete("/delete/:userId", authenticate, isAdmin, async (req, res) => {
  try {
    const userIdToDelete = req.params.userId;

    if (!userIdToDelete)
      return res.status(400).json({ message: "User ID is required" });

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
// Update profile image
router.put("/update-profile-image", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { image_url } = req.body;

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image_url },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    delete updatedUser.password;

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile image error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile image",
    });
  }
});

module.exports = router;

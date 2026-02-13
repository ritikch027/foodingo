const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Cart = require("../../models/cart");
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(64).required(),
  phone: Joi.string().trim().min(8).max(15).required(),
});

const register = async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body, {
      abortEarly: true,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    let { name, email, phone, password } = value;

    email = email.toLowerCase().trim();
    phone = phone.trim();

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    }).lean();

    if (existingUser) {
      const duplicateField = existingUser.email === email ? "email" : "phone";
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${duplicateField}`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
    });

    const { password: _, ...safeUser } = newUser.toObject();

    res.status(201).json({
      success: true,
      user: safeUser,
    });
  } catch (err) {
    console.error("Register error:", err);

    if (err?.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `User already exists with this ${duplicateField}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const loginUser = async (req, res) => {
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

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      await Cart.create({ user: user._id, items: [] });
    }

    user.lastLoginAt = new Date();
    await user.save();

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
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user.id;

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
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { image_url, name } = req.body;
    const updates = {};

    if (typeof image_url === "string" && image_url.trim()) {
      updates.image_url = image_url.trim();
    }

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field: name or image_url",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
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
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  register,
  loginUser,
  getUserData,
  updateProfile,
};

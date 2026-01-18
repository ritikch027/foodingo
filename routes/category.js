const express = require("express");
const router = express.Router();
const Joi = require("joi");

const Category = require("../models/categories");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");

// Validation schema
const categorySchema = Joi.object({
  category: Joi.string().min(2).max(30).required(),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).required(),
});

// Get all categories (FAST)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find()
      .select("category image.url")
      .sort({ category: 1 })
      .lean();

    res.json({ success: true, categories });
  } catch (err) {
    console.error("Get categories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// Create category (ADMIN only)
router.post("/categories", authenticate, isAdmin, async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    let { category, image } = value;

    // Normalize
    category = category.trim().toLowerCase();

    const exists = await Category.exists({ category });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = await Category.create({
      category,
      image,
    });

    res.status(201).json({
      success: true,
      category: newCategory,
    });
  } catch (err) {
    console.error("Create category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
});

module.exports = router;

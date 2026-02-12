const express = require("express");
const router = express.Router();
const Joi = require("joi");
const mongoose = require("mongoose");

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

const updateCategorySchema = Joi.object({
  category: Joi.string().min(2).max(30).optional(),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).optional(),
}).min(1);

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

// Update category (ADMIN only)
router.patch("/categories/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const { error, value } = updateCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (value.category) {
      value.category = value.category.trim().toLowerCase();
      const exists = await Category.exists({
        _id: { $ne: id },
        category: value.category,
      });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }
    }

    const category = await Category.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({ success: true, category });
  } catch (err) {
    console.error("Update category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
});

// Delete category (ADMIN only)
router.delete("/categories/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const category = await Category.findByIdAndDelete(id).lean();
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Delete category:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
});

module.exports = router;

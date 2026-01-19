const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const cloudinary = require("cloudinary").v2;

const Item = require("../models/item");
const Restaurant = require("../models/restaurant");
const authenticate = require("../middleware/authenticate");

// Cloudinary config (once in app bootstrap is better)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------- Validation ----------
const createItemSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  category: Joi.string().min(2).max(50).required(),
  price: Joi.number().min(1).required(),
  discountPercent: Joi.number().min(0).max(90).default(0),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).required(),
  isVeg: Joi.boolean().default(false),
});

// ---------- Read: by category (FAST) ----------
router.get("/items/category/:categoryName", async (req, res) => {
  try {
    const category = req.params.categoryName.trim();

    const items = await Item.find({ category })
      .select("name offerPrice image.url isVeg restaurant")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, items });
  } catch (err) {
    console.error("Items by category:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

// ---------- Read: by restaurant (FAST) ----------
router.get("/items/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const items = await Item.find({ restaurant: restaurantId })
      .select("name offerPrice image.url isVeg")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, items });
  } catch (err) {
    console.error("Items by restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

// ---------- Create: owner only ----------
router.post("/items/:restaurantId", authenticate, async (req, res) => {
  try {
    const { error, value } = createItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const restaurant = await Restaurant.findById(restaurantId).select("owner");
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Create your restaurant first" });
    }

    if (restaurant.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not the restaurant owner" });
    }

    const item = await Item.create({
      ...value,
      category: value.category.toLowerCase().trim(),
      restaurant: restaurantId,
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("Create item:", err);
    res.status(500).json({ success: false, message: "Failed to create item" });
  }
});

// ---------- Delete: owner only (safe Cloudinary delete) ----------
router.delete(
  "/items/:restaurantId/:productId",
  authenticate,
  async (req, res) => {
    try {
      const { restaurantId, productId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(restaurantId) ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({ success: false, message: "Invalid ids" });
      }

      const restaurant =
        await Restaurant.findById(restaurantId).select("owner");
      if (!restaurant) {
        return res
          .status(404)
          .json({ success: false, message: "Restaurant not found" });
      }

      if (restaurant.owner.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ success: false, message: "Not the restaurant owner" });
      }

      const item = await Item.findById(productId).select("image.public_id");
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      // Delete image by stored public_id (reliable)
      if (item.image?.public_id) {
        await cloudinary.uploader.destroy(item.image.public_id);
      }

      await item.deleteOne();

      res.json({ success: true, message: "Item deleted successfully" });
    } catch (err) {
      console.error("Delete item:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete item" });
    }
  },
);

module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const cloudinary = require("cloudinary").v2;

const Item = require("../models/item");
const Restaurant = require("../models/restaurant");
const Cart = require("../models/cart");
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

const updateItemSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  category: Joi.string().min(2).max(50).optional(),
  price: Joi.number().min(1).optional(),
  discountPercent: Joi.number().min(0).max(90).optional(),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).optional(),
  isVeg: Joi.boolean().optional(),
}).min(1);

const searchSchema = Joi.object({
  q: Joi.string().min(1).max(80).optional(),
  category: Joi.string().min(2).max(50).optional(),
  restaurantId: Joi.string().optional(),
  isVeg: Joi.boolean().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  sort: Joi.string()
    .valid("name_asc", "name_desc", "price_asc", "price_desc")
    .optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(20),
});

// ---------- Search items ----------
router.get("/items/search", async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query, {
      convert: true,
    });
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const {
      q,
      category,
      restaurantId,
      isVeg,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    } = value;

    if (restaurantId && !mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const filter = {};

    if (q) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ name: regex }, { category: regex }];
    }

    if (category) {
      filter.category = new RegExp(`^${category.trim()}$`, "i");
    }

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    if (typeof isVeg === "boolean") {
      filter.isVeg = isVeg;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.offerPrice = {};
      if (minPrice !== undefined) filter.offerPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.offerPrice.$lte = maxPrice;
    }

    let sortBy = { name: 1 };
    if (sort === "name_desc") sortBy = { name: -1 };
    if (sort === "price_asc") sortBy = { offerPrice: 1 };
    if (sort === "price_desc") sortBy = { offerPrice: -1 };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .select(
          "name offerPrice image.url price discountPercent isVeg restaurant category",
        )
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(filter),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Search items:", err);
    res.status(500).json({ success: false, message: "Failed to search items" });
  }
});

// ---------- Read: by category (FAST) ----------
router.get("/items/category/:categoryName", async (req, res) => {
  try {
    const category = req.params.categoryName.trim();

    const items = await Item.find({
      category: new RegExp(`^${category}$`, "i"), // case-insensitive match
    })
      .select(
        "name offerPrice image.url price discountPercent isVeg restaurant",
      )
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
      .select(
        "name offerPrice image.url price discountPercent isVeg restaurant",
      )
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, items });
  } catch (err) {
    console.error("Items by restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
});

// ---------- Read: single item ----------
router.get("/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid itemId" });
    }

    const item = await Item.findById(itemId)
      .select(
        "name offerPrice image.url price discountPercent isVeg restaurant category",
      )
      .lean();

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.json({ success: true, item });
  } catch (err) {
    console.error("Get item:", err);
    res.status(500).json({ success: false, message: "Failed to fetch item" });
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

// ---------- Update: owner only ----------
router.patch(
  "/items/:restaurantId/:productId",
  authenticate,
  async (req, res) => {
    try {
      const { restaurantId, productId } = req.params;

      const { error, value } = updateItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

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

      const item = await Item.findOne({
        _id: productId,
        restaurant: restaurantId,
      });
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found" });
      }

      if (value.name !== undefined) item.name = value.name;
      if (value.category !== undefined) {
        item.category = value.category.toLowerCase().trim();
      }
      if (value.price !== undefined) item.price = value.price;
      if (value.discountPercent !== undefined) {
        item.discountPercent = value.discountPercent;
      }
      if (value.image !== undefined) item.image = value.image;
      if (value.isVeg !== undefined) item.isVeg = value.isVeg;

      await item.save();

      res.json({ success: true, item });
    } catch (err) {
      console.error("Update item:", err);
      res.status(500).json({ success: false, message: "Failed to update item" });
    }
  },
);

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

      const item = await Item.findOne({
        _id: productId,
        restaurant: restaurantId,
      }).select("image.public_id");
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
      await Cart.updateMany(
        { "items.productId": item._id },
        { $pull: { items: { productId: item._id } } },
      );

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

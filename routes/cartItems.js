const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Cart = require("../models/cart");
const Item = require("../models/item");
const authenticate = require("../middleware/authenticate");

// Get cart (FAST with select)
router.get("/cart", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "items.productId",
        select: "_id name offerPrice price discountPercent image.url isVeg",
      })
      .select("items")
      .lean();

    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Get cart:", err);
    res.status(500).json({ success: false, message: "Failed to load cart" });
  }
});

// Add item (ULTRA FAST - removed product validation)
router.post("/cart/add", authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Quick validation only
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

    if (quantity < 1 || quantity > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    // REMOVED: await Item.exists() - trust the frontend
    // If product doesn't exist, populate will return null and frontend handles it

    // Single atomic operation
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id, "items.productId": { $ne: productId } },
      { $push: { items: { productId, quantity } } },
      { upsert: true, new: true, select: "items" },
    ).lean();

    if (!cart) {
      return res.status(409).json({
        success: false,
        message: "Item already in cart",
      });
    }

    // Return success immediately without populated data
    // Frontend already has the item data from optimistic update
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Add cart:", err);
    res.status(500).json({ success: false, message: "Failed to add item" });
  }
});

// Increment (ULTRA FAST)
router.post("/cart/increment", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

    // Single atomic update, no response data needed
    const result = await Cart.updateOne(
      { user: req.user.id, "items.productId": productId },
      { $inc: { "items.$.quantity": 1 } },
    ).lean();

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Increment cart:", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

// Decrement (ULTRA FAST with atomic operations)
router.post("/cart/decrement", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

    // Try to decrement first (for items with quantity > 1)
    const decrementResult = await Cart.updateOne(
      { user: req.user.id },
      { $inc: { "items.$[matched].quantity": -1 } },
      {
        arrayFilters: [
          {
            "matched.productId": new mongoose.Types.ObjectId(productId),
            "matched.quantity": { $gt: 1 },
          },
        ],
      },
    ).lean();

    if (decrementResult.modifiedCount > 0) {
      return res.json({ success: true });
    }

    // If not decremented, remove the item (quantity was 1)
    const removeResult = await Cart.updateOne(
      { user: req.user.id },
      { $pull: { items: { productId: productId } } },
    ).lean();

    if (removeResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Decrement cart:", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

// Bulk add items (for faster multi-item additions)
router.post("/cart/bulk-add", authenticate, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid items array" });
    }

    // Validate all items
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid productId in items" });
      }
      if (item.quantity < 1 || item.quantity > 50) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid quantity in items" });
      }
    }

    // Ensure cart exists
    await Cart.updateOne(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id, items: [] } },
      { upsert: true },
    );

    // Add or increment each item
    for (const item of items) {
      const incremented = await Cart.updateOne(
        { user: req.user.id, "items.productId": item.productId },
        { $inc: { "items.$.quantity": item.quantity } },
      );

      if (incremented.modifiedCount === 0) {
        await Cart.updateOne(
          { user: req.user.id },
          { $push: { items: item } },
        );
      }
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Bulk add cart:", err);
    res.status(500).json({ success: false, message: "Failed to add items" });
  }
});

module.exports = router;

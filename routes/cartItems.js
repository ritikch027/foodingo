const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Cart = require("../models/cart");
const Item = require("../models/item");
const authenticate = require("../middleware/authenticate");

// Get cart (FAST)
router.get("/cart", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.productId", "name offerPrice image.url")
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

// Add item (atomic, no duplicates)
router.post("/cart/add", authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

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

    const productExists = await Item.exists({ _id: productId });
    if (!productExists) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id, "items.productId": { $ne: productId } },
      { $push: { items: { productId, quantity } } },
      { upsert: true, new: true },
    );

    if (!cart) {
      return res.status(409).json({
        success: false,
        message: "Item already exists in cart. Use increment instead.",
      });
    }

    res.status(201).json({ success: true, cart });
  } catch (err) {
    console.error("Add cart:", err);
    res.status(500).json({ success: false, message: "Failed to add item" });
  }
});

// Increment (atomic)
router.post("/cart/increment", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id, "items.productId": productId },
      { $inc: { "items.$.quantity": 1 } },
      { new: true },
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    res.json({ success: true, cart });
  } catch (err) {
    console.error("Increment cart:", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

// Decrement (remove if reaches zero)
router.post("/cart/decrement", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items = cart.items.filter(
        (i) => i.productId.toString() !== productId,
      );
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error("Decrement cart:", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
});

module.exports = router;

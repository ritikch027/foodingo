const mongoose = require("mongoose");

const Cart = require("../../models/cart");
const Item = require("../../models/item");

const getCart = async (req, res) => {
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

    const validItems = cart.items.filter((entry) => entry.productId);
    res.json({ success: true, cart: { items: validItems } });
  } catch (err) {
    console.error("Get cart:", err);
    res.status(500).json({ success: false, message: "Failed to load cart" });
  }
};

const addToCart = async (req, res) => {
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

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Add cart:", err);
    res.status(500).json({ success: false, message: "Failed to add item" });
  }
};

const incrementCartItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

    const itemExists = await Item.exists({ _id: productId });
    if (!itemExists) {
      await Cart.updateOne(
        { user: req.user.id },
        { $pull: { items: { productId } } },
      );
      return res
        .status(404)
        .json({ success: false, message: "Item no longer exists" });
    }

    const result = await Cart.updateOne(
      { user: req.user.id, "items.productId": productId },
      { $inc: { "items.$[matched].quantity": 1 } },
      {
        arrayFilters: [
          {
            "matched.productId": new mongoose.Types.ObjectId(productId),
            "matched.quantity": { $lt: 50 },
          },
        ],
      },
    );

    if (result.modifiedCount === 0) {
      const itemInCart = await Cart.exists({
        user: req.user.id,
        "items.productId": productId,
      });
      if (itemInCart) {
        return res
          .status(400)
          .json({ success: false, message: "Maximum quantity reached" });
      }
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Increment cart:", err);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};

const decrementCartItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid productId" });
    }

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
    );

    if (decrementResult.modifiedCount > 0) {
      return res.json({ success: true });
    }

    const removeResult = await Cart.updateOne(
      { user: req.user.id },
      { $pull: { items: { productId } } },
    );

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
};

const bulkAddToCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid items array" });
    }

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

    await Cart.updateOne(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id, items: [] } },
      { upsert: true },
    );

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
};

module.exports = {
  getCart,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  bulkAddToCart,
};

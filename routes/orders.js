const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const Cart = require("../models/cart");
const Restaurant = require("../models/restaurant");
const authenticate = require("../middleware/authenticate");

// ---------------- USER PLACES ORDER ----------------
router.post("/orders", authenticate, async (req, res) => {
  try {
    const { address } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.productId")
      .lean();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const restaurantId = cart.items[0].productId.restaurant;

    const items = cart.items.map((i) => ({
      productId: i.productId._id,
      name: i.productId.name,
      price: i.productId.offerPrice,
      quantity: i.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress: { address },
    });

    // Clear cart after order
    await Cart.deleteOne({ user: req.user.id });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Create order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// ---------------- USER ORDER HISTORY ----------------
router.get("/orders/my", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ---------------- RESTAURANT DASHBOARD ----------------
router.get("/restaurant/orders", authenticate, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(403).json({ message: "Not restaurant owner" });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ message: "Failed to fetch restaurant orders" });
  }
});

// ---------------- RESTAURANT UPDATE STATUS ----------------
router.patch("/orders/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(403).json({ message: "Not restaurant owner" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurant._id },
      { status },
      { new: true },
    );

    res.json({ success: true, order });
  } catch {
    res.status(500).json({ message: "Failed to update order" });
  }
});

module.exports = router;

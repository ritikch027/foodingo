const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Cart = require("../models/cart");
const Restaurant = require("../models/restaurant");
const authenticate = require("../middleware/authenticate");

// ---------------- USER PLACES ORDER ----------------
router.post("/orders", authenticate, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.productId")
      .lean();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Guard against missing items (deleted products)
    const missingItem = cart.items.find((i) => !i.productId);
    if (missingItem) {
      return res.status(400).json({ message: "Cart has invalid items" });
    }

    const restaurantId = cart.items[0].productId.restaurant;

    // Ensure all items are from the same restaurant
    const mixedRestaurant = cart.items.some(
      (i) => i.productId.restaurant.toString() !== restaurantId.toString(),
    );
    if (mixedRestaurant) {
      return res.status(400).json({ message: "Cart contains multiple restaurants" });
    }

    const items = cart.items.map((i) => ({
      productId: i.productId._id,
      name: i.productId.name,
      price: i.productId.offerPrice || i.productId.price,
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

    const allowedStatuses = [
      "PENDING_PAYMENT",
      "PAID",
      "ACCEPTED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(403).json({ message: "Not restaurant owner" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurant._id },
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch {
    res.status(500).json({ message: "Failed to update order" });
  }
});

module.exports = router;

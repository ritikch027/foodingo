const express = require("express");
const router = express.Router();
const Restaurant = require("../models/restaurant");
const User = require("../models/user");
const Item = require("../models/item");
const authenticate = require("../middleware/authenticate");

// ✅ GET all restaurants
router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete(
  "/restaurant/delete/:restaurantId",
  authenticate,
  async (req, res) => {
    try {
      const { restaurantId } = req.params;

      // Find the restaurant first to get the user reference
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res
          .status(404)
          .json({ success: false, message: "Restaurant not found" });
      }

      const _id = restaurant.owner; // Assuming your Restaurant model has a 'user' field

      // 1️⃣ Delete all items of the restaurant
      await Item.deleteMany({ restaurant: restaurantId });

      // 2️⃣ Delete the restaurant
      await Restaurant.findByIdAndDelete(restaurantId);

      // 3️⃣ Update the user's role to "customer"
      await User.findByIdAndUpdate(_id, { role: "customer" });

      res.status(200).json({
        success: true,
        message: "Restaurant deleted and user role updated.",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ✅ POST - Create a new restaurant
router.post("/restaurants", authenticate, async (req, res) => {
  try {
    const { name, rating = 4.0, deliveryTime = 30, location, image } = req.body;

    // ✅ Validate required fields
    if (!name || !location) {
      return res
        .status(401)
        .json({ success: false, message: "Name and location are required" });
    }

    const owner = req.userId; // from JWT middleware

    // ✅ Optional: Check if user already owns a restaurant
    const existing = await Restaurant.findOne({ owner });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You already have a restaurant" });
    }

    const newRestaurant = new Restaurant({
      name,
      owner,
      rating,
      deliveryTime,
      location,
      image,
    });

    await newRestaurant.save();

    // ✅ Update user's role
    await User.findByIdAndUpdate(owner, {
      role: "owner",
      restaurant: newRestaurant._id,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant: newRestaurant,
    });
  } catch (err) {
    console.error("Error creating restaurant:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
});

module.exports = router;

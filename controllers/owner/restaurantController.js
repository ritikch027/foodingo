const mongoose = require("mongoose");
const Joi = require("joi");

const Restaurant = require("../../models/restaurant");
const User = require("../../models/user");
const Item = require("../../models/item");
const Cart = require("../../models/cart");
const Order = require("../../models/order");

const updateRestaurantSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  location: Joi.string().min(2).max(100).optional(),
  rating: Joi.number().min(1).max(5).optional(),
  deliveryTime: Joi.number().min(5).max(180).optional(),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).optional(),
}).min(1);

const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      rating = 4.0,
      deliveryTime = 30,
      location,
      image,
    } = req.body;

    if (!name || !location) {
      return res
        .status(400)
        .json({ success: false, message: "Name and location are required" });
    }

    const owner = req.user.id;

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
};

const updateRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const { error, value } = updateRestaurantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    if (
      restaurant.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (value.name !== undefined) restaurant.name = value.name;
    if (value.location !== undefined) restaurant.location = value.location;
    if (value.rating !== undefined) restaurant.rating = value.rating;
    if (value.deliveryTime !== undefined) {
      restaurant.deliveryTime = value.deliveryTime;
    }
    if (value.image !== undefined) restaurant.image = value.image;

    await restaurant.save();

    res.json({ success: true, restaurant });
  } catch (err) {
    console.error("Update restaurant:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update restaurant" });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    const ownerId = restaurant.owner;

    if (ownerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const restaurantItems = await Item.find({ restaurant: restaurantId })
      .select("_id")
      .lean();
    const itemIds = restaurantItems.map((item) => item._id);

    await Item.deleteMany({ restaurant: restaurantId });

    if (itemIds.length > 0) {
      await Cart.updateMany(
        { "items.productId": { $in: itemIds } },
        { $pull: { items: { productId: { $in: itemIds } } } },
      );
    }

    await Order.deleteMany({ restaurant: restaurantId });

    await Restaurant.findByIdAndDelete(restaurantId);

    await User.findByIdAndUpdate(ownerId, {
      role: "customer",
      restaurant: null,
    });

    res.status(200).json({
      success: true,
      message: "Restaurant deleted and user role updated.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};

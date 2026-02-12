const mongoose = require("mongoose");
const Joi = require("joi");
const cloudinary = require("cloudinary").v2;

const Item = require("../../models/item");
const Restaurant = require("../../models/restaurant");
const Cart = require("../../models/cart");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const createItem = async (req, res) => {
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
};

const updateItem = async (req, res) => {
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

    const restaurant = await Restaurant.findById(restaurantId).select("owner");
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
};

const deleteItem = async (req, res) => {
  try {
    const { restaurantId, productId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(restaurantId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ success: false, message: "Invalid ids" });
    }

    const restaurant = await Restaurant.findById(restaurantId).select("owner");
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
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};

module.exports = {
  createItem,
  updateItem,
  deleteItem,
};

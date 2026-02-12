const mongoose = require("mongoose");
const Joi = require("joi");

const Category = require("../../models/categories");
const Offer = require("../../models/offer");
const Item = require("../../models/item");
const Restaurant = require("../../models/restaurant");

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

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .select("category image.url")
      .sort({ category: 1 })
      .lean();

    res.json({ success: true, categories });
  } catch (err) {
    console.error("Get categories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .select("title description discountPercent image.url")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, offers });
  } catch (err) {
    console.error("Get offers:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
    });
  }
};

const searchItems = async (req, res) => {
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
};

const getItemsByCategory = async (req, res) => {
  try {
    const category = req.params.categoryName.trim();

    const items = await Item.find({
      category: new RegExp(`^${category}$`, "i"),
    })
      .select("name offerPrice image.url price discountPercent isVeg restaurant")
      .lean();

    res.json({ success: true, items });
  } catch (err) {
    console.error("Items by category:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
};

const getItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurantId" });
    }

    const items = await Item.find({ restaurant: restaurantId })
      .select("name offerPrice image.url price discountPercent isVeg restaurant")
      .sort({ name: 1 })
      .lean();

    res.json({ success: true, items });
  } catch (err) {
    console.error("Items by restaurant:", err);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
};

const getItemById = async (req, res) => {
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
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().lean();
    res.status(200).json({ success: true, restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories,
  getOffers,
  searchItems,
  getItemsByCategory,
  getItemsByRestaurant,
  getItemById,
  getRestaurants,
};

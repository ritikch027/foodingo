const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const {
  searchItems,
  getItemsByCategory,
  getItemsByRestaurant,
  getItemById,
} = require("../../controllers/customer/publicController");
const {
  createItem,
  updateItem,
  deleteItem,
} = require("../../controllers/owner/itemController");

router.get("/items/search", searchItems);
router.get("/items/category/:categoryName", getItemsByCategory);
router.get("/items/restaurant/:restaurantId", getItemsByRestaurant);
router.get("/items/:itemId", getItemById);
router.post("/items/:restaurantId", authenticate, createItem);
router.patch("/items/:restaurantId/:productId", authenticate, updateItem);
router.delete("/items/:restaurantId/:productId", authenticate, deleteItem);

module.exports = router;

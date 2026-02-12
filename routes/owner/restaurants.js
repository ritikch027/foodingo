const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const { getRestaurants } = require("../../controllers/customer/publicController");
const {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../../controllers/owner/restaurantController");

router.get("/restaurants", getRestaurants);
router.delete("/restaurant/delete/:restaurantId", authenticate, deleteRestaurant);
router.post("/restaurants", authenticate, createRestaurant);
router.patch("/restaurants/:restaurantId", authenticate, updateRestaurant);

module.exports = router;

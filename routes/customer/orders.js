const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const { createOrder, getMyOrders } = require("../../controllers/customer/orderController");
const {
  getRestaurantOrders,
  updateOrderStatus,
} = require("../../controllers/owner/orderController");

router.post("/orders", authenticate, createOrder);
router.get("/orders/my", authenticate, getMyOrders);
router.get("/restaurant/orders", authenticate, getRestaurantOrders);
router.patch("/orders/:id/status", authenticate, updateOrderStatus);

module.exports = router;

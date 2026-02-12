const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const {
  getCart,
  addToCart,
  incrementCartItem,
  decrementCartItem,
  bulkAddToCart,
} = require("../../controllers/customer/cartController");

router.get("/cart", authenticate, getCart);
router.post("/cart/add", authenticate, addToCart);
router.post("/cart/increment", authenticate, incrementCartItem);
router.post("/cart/decrement", authenticate, decrementCartItem);
router.post("/cart/bulk-add", authenticate, bulkAddToCart);

module.exports = router;

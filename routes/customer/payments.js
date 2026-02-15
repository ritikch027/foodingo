const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../../controllers/customer/paymentController");

router.post("/payments/razorpay/order", authenticate, createRazorpayOrder);
router.post("/payments/razorpay/verify", authenticate, verifyRazorpayPayment);

module.exports = router;

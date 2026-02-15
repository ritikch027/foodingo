const crypto = require("crypto");
const Razorpay = require("razorpay");

const Cart = require("../../models/cart");
const Order = require("../../models/order");

const getOrderDraftFromCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.productId").lean();

  if (!cart || cart.items.length === 0) {
    return { error: { code: 400, message: "Cart is empty" } };
  }

  const missingItem = cart.items.find((i) => !i.productId);
  if (missingItem) {
    return { error: { code: 400, message: "Cart has invalid items" } };
  }

  const restaurantId = cart.items[0].productId.restaurant;
  const mixedRestaurant = cart.items.some(
    (i) => i.productId.restaurant.toString() !== restaurantId.toString(),
  );

  if (mixedRestaurant) {
    return { error: { code: 400, message: "Cart contains multiple restaurants" } };
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

  return {
    draft: {
      restaurantId,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
    },
  };
};

const createRazorpayOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured",
      });
    }

    const address = req.body.address || req.body.deliveryAddress?.address;
    if (!address || !String(address).trim()) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const { draft, error } = await getOrderDraftFromCart(req.user.id);
    if (error) {
      return res.status(error.code).json({ success: false, message: error.message });
    }

    const order = await Order.create({
      user: req.user.id,
      restaurant: draft.restaurantId,
      items: draft.items,
      subtotal: draft.subtotal,
      deliveryFee: draft.deliveryFee,
      totalAmount: draft.totalAmount,
      deliveryAddress: { address: String(address).trim() },
      paymentMethod: "ONLINE",
      paymentGateway: "RAZORPAY",
      status: "PENDING_PAYMENT",
      isPaid: false,
    });

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amount = Math.round(order.totalAmount * 100);

    const rpOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${order._id.toString()}`,
      notes: {
        appOrderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    order.razorpayOrderId = rpOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      razorpayOrderId: rpOrder.id,
      razorpay_order_id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId,
      key: keyId,
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error("Create Razorpay order:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured",
      });
    }

    const appOrderId = req.body.orderId || req.body.order_id;
    const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
    const razorpayPaymentId =
      req.body.razorpayPaymentId || req.body.razorpay_payment_id;
    const razorpaySignature =
      req.body.razorpaySignature || req.body.razorpay_signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    let order = null;
    if (appOrderId) {
      order = await Order.findById(appOrderId);
    } else {
      order = await Order.findOne({ razorpayOrderId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentMethod = "ONLINE";
    order.paymentGateway = "RAZORPAY";
    order.status = "PAID";

    await order.save();
    await Cart.deleteOne({ user: req.user.id });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error("Verify Razorpay payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};

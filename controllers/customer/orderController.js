const Order = require("../../models/order");
const Cart = require("../../models/cart");

const createOrder = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.trim()) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.productId")
      .lean();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const missingItem = cart.items.find((i) => !i.productId);
    if (missingItem) {
      return res.status(400).json({ message: "Cart has invalid items" });
    }

    const restaurantId = cart.items[0].productId.restaurant;

    const mixedRestaurant = cart.items.some(
      (i) => i.productId.restaurant.toString() !== restaurantId.toString(),
    );
    if (mixedRestaurant) {
      return res.status(400).json({ message: "Cart contains multiple restaurants" });
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

    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurantId,
      items,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress: { address },
      paymentMethod: "COD",
      isPaid: false,
      paymentGateway: null,
      status: "PENDING_PAYMENT",
    });

    await Cart.deleteOne({ user: req.user.id });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Create order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};

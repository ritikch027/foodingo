const { Schema, model } = require("mongoose");

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
    },

    subtotal: Number,
    deliveryFee: {
      type: Number,
      default: 40,
    },
    totalAmount: Number,

    deliveryAddress: {
      address: String,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentGateway: {
      type: String,
      enum: ["RAZORPAY", null],
      default: null,
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PAID",
        "ACCEPTED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELED",
      ],
      default: "PENDING_PAYMENT",
      
    },
  },
  { timestamps: true },
);

// Indexes
OrderSchema.index({ user: 1 });
OrderSchema.index({ restaurant: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ razorpayOrderId: 1 });

module.exports = model("Order", OrderSchema);

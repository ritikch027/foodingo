const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const RestaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      unique: true,
      set: capitalizeWords,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      set: capitalizeWords,
    },

    rating: {
      type: Number,
      default: 4,
      min: 1,
      max: 5,
    },

    deliveryTime: {
      type: Number,
      required: true,
      min: 5,
      max: 180, 
    },

    image: {
      url: {
        type: String,
        required: true,
        trim: true,
        match: /^https?:\/\/.+/i,
      },
      public_id: {
        type: String,
        default: null,
      },
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    // Only store references — not full objects
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
RestaurantSchema.index({ location: 1 });
RestaurantSchema.index({ rating: -1 });
RestaurantSchema.index({ "items.productId": 1 });

module.exports = model("Restaurant", RestaurantSchema);

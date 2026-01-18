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

const ItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      set: capitalizeWords,
      index: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    discountPercent: {
      type: Number,
      min: 0,
      max: 90,
      default: 0,
    },

    offerPrice: {
      type: Number,
      min: 1,
      immutable: true, // cannot be manually overridden
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

    isVeg: {
      type: Boolean,
      default: false,
      index: true,
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-calculate offer price
ItemSchema.pre("save", function (next) {
  if (this.isModified("price") || this.isModified("discountPercent")) {
    if (this.discountPercent > 0) {
      this.offerPrice = Math.round(
        this.price - (this.price * this.discountPercent) / 100,
      );
    } else {
      this.offerPrice = this.price;
    }
  }
  next();
});

// Indexes
ItemSchema.index({ category: 1 });
ItemSchema.index({ restaurant: 1 });
ItemSchema.index({ isVeg: 1 });
ItemSchema.index({ price: 1 });

module.exports = model("Item", ItemSchema);

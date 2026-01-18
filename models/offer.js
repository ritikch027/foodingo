const { Schema, model } = require("mongoose");

const OfferSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    discountPercent: {
      type: Number,
      min: 1,
      max: 90,
      required: true,
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

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index
OfferSchema.index({ title: 1 });
OfferSchema.index({ isActive: 1 });

module.exports = model("Offer", OfferSchema);

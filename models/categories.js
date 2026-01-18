const { Schema, model } = require("mongoose");

const capitalizeWords = (str) => {
  if (!str) return "";
  return str
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const CategorySchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
      set: capitalizeWords,
      index: true,
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
  },
  {
    timestamps: true,
  },
);

// Explicit index (important for production)
CategorySchema.index({ category: 1 }, { unique: true });

module.exports = model("Category", CategorySchema);

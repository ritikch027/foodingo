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

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      set: capitalizeWords,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 15,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    image_url: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg",
      match: /^https?:\/\/.+/i,
    },

    role: {
      type: String,
      enum: ["customer", "owner", "admin"],
      default: "customer",
    },

    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ restaurant: 1 });
UserSchema.index({ isBanned: 1 });
UserSchema.index({ isDeleted: 1 });

module.exports = model("User", UserSchema);

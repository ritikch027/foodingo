const express = require("express");
const router = express.Router();
const Joi = require("joi");
const mongoose = require("mongoose");

const Offer = require("../models/offer");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");

// ---------- Validation ----------
const offerSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  description: Joi.string().max(500).allow("").optional(),
  discountPercent: Joi.number().min(1).max(90).required(),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).required(),
});

const updateOfferSchema = Joi.object({
  title: Joi.string().min(3).max(50).optional(),
  description: Joi.string().max(500).allow("").optional(),
  discountPercent: Joi.number().min(1).max(90).optional(),
  image: Joi.object({
    url: Joi.string().uri().required(),
    public_id: Joi.string().optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// ---------- Get active offers (FAST) ----------
router.get("/offers", async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .select("title description discountPercent image.url")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, offers });
  } catch (err) {
    console.error("Get offers:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
    });
  }
});

// ---------- Create offer (ADMIN only) ----------
router.post("/offers", authenticate, isAdmin, async (req, res) => {
  try {
    const { error, value } = offerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const offer = await Offer.create(value);

    res.status(201).json({
      success: true,
      offer,
    });
  } catch (err) {
    console.error("Create offer:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create offer",
    });
  }
});

// ---------- Update offer (ADMIN only) ----------
router.patch("/offers/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer id",
      });
    }

    const { error, value } = updateOfferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const offer = await Offer.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).lean();

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({ success: true, offer });
  } catch (err) {
    console.error("Update offer:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update offer",
    });
  }
});

// ---------- Delete offer (ADMIN only) ----------
router.delete("/offers/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer id",
      });
    }

    const offer = await Offer.findByIdAndDelete(id).lean();
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({ success: true, message: "Offer deleted" });
  } catch (err) {
    console.error("Delete offer:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
    });
  }
});

module.exports = router;

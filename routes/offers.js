const express = require("express");
const router = express.Router();
const Joi = require("joi");

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

module.exports = router;

const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const isAdmin = require("../../middleware/isAdmin");
const { getOffers } = require("../../controllers/customer/publicController");
const {
  createOffer,
  updateOffer,
  deleteOffer,
} = require("../../controllers/admin/offerController");

router.get("/offers", getOffers);
router.post("/offers", authenticate, isAdmin, createOffer);
router.patch("/offers/:id", authenticate, isAdmin, updateOffer);
router.delete("/offers/:id", authenticate, isAdmin, deleteOffer);

module.exports = router;

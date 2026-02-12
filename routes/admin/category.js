const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const isAdmin = require("../../middleware/isAdmin");
const { getCategories } = require("../../controllers/customer/publicController");
const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/admin/categoryController");

router.get("/categories", getCategories);
router.post("/categories", authenticate, isAdmin, createCategory);
router.patch("/categories/:id", authenticate, isAdmin, updateCategory);
router.delete("/categories/:id", authenticate, isAdmin, deleteCategory);

module.exports = router;

const express = require("express");
const router = express.Router();

const isAdmin = require("../../middleware/isAdmin");
const authenticate = require("../../middleware/authenticate");
const { getAdmins, handleBan } = require("../../controllers/admin/adminController");

router.get("/admin", authenticate, isAdmin, getAdmins);
router.patch("/admin/handle-ban/:userId", authenticate, isAdmin, handleBan);

module.exports = router;

const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authenticate");
const isAdmin = require("../../middleware/isAdmin");
const rateLimit = require("express-rate-limit");

const {
  register,
  loginUser,
  getUserData,
  updateProfile,
} = require("../../controllers/customer/userController");
const {
  getAllUsers,
  deleteUser,
} = require("../../controllers/admin/userController");

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

router.get("/users", authenticate, isAdmin, getAllUsers);
router.post("/register", registerLimiter, register);
router.post("/login-user", loginLimiter, loginUser);
router.get("/userdata", authenticate, getUserData);
router.delete("/delete/:userId", authenticate, isAdmin, deleteUser);
router.put("/update-profile", authenticate, updateProfile);

module.exports = router;

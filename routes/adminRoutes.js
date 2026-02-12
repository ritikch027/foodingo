const express = require("express");
const isAdmin = require("../middleware/isAdmin");
const authenticate = require("../middleware/authenticate");
const router = express.Router();
const User = require("../models/user");

router.get("/admin", authenticate, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email role isBanned")
      .lean();
    res.status(200).json({ success: true, admins });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.patch(
  "/admin/handle-ban/:userId",
  authenticate,
  isAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { action } = req.body; // expected "ban" or "unban"

      if (!userId || !action) {
        return res
          .status(400)
          .json({ message: "User ID and action are required" });
      }

      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ message: "User not found" });

      if (action === "ban") {
        if (user.isBanned) {
          return res.status(400).json({ message: "User is already banned" });
        }

        user.isBanned = true;
        await user.save();
        return res.status(200).json({ message: "User banned successfully" });
      }

      if (action === "unban") {
        if (!user.isBanned) {
          return res
            .status(400)
            .json({ message: "User is already unbanned" });
        }

        user.isBanned = false;
        await user.save();
        return res.status(200).json({ message: "User unbanned successfully" });
      }

      return res.status(400).json({ message: "Invalid action" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  },
);

module.exports = router;

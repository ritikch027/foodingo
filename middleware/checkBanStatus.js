const User = require("../models/user");

const checkBanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Account suspended",
      });
    }

    req.user = user;
    res.set("x-user-status", "active");
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkBanStatus;

const User = require("../../models/user");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone role isBanned lastLoginAt createdAt")
      .lean();
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.userId;

    if (!userIdToDelete) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};

const User = require("../models/userModel");

const create = async (req, res) => {
  try {
    const { name, email, mobile, userType, city, state } = req.body;

    // Find user by mobile number
    const existingUser = await User.findOne({ mobile });

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found. Please verify mobile number first.",
      });
    }

    // Update existing user data
    existingUser.name = name || existingUser.name;
    existingUser.email = email || existingUser.email;
    existingUser.userType = userType || existingUser.userType;
    existingUser.city = city || existingUser.city;
    existingUser.state = state || existingUser.state;

    await existingUser.save();

    res.status(200).json({
      message: "User details saved successfully",
      user: existingUser,
    });
  } catch (error) {
    console.error("Save User Details Error:", error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const get = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const user = await User.findById(userId).select("-__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, userType, city, state } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, userType, city, state },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  get,
  update,
  remove,
};

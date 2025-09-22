const Cart = require("../models/cartModel");
const Course = require("../models/courseModel");

const get = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.course");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const add = async (req, res) => {
  const { courseCode } = req.body;

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find course ObjectId by courseCode
    const course = await Course.findOne({ courseCode });
    if (!course) return res.status(404).json({ message: "Course not found" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const courseExists = cart.items.find(
      i => i.course.toString() === course._id.toString()
    );

    if (courseExists) {
      courseExists.quantity += 1;
    } else {
      cart.items.push({ course: course._id });
    }

    await cart.save();
    await cart.populate("items.course");

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  const { courseCode } = req.body;

  try {
    const course = await Course.findOne({ courseCode });
    if (!course) return res.status(404).json({ message: "Course not found" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      i => i.course.toString() !== course._id.toString()
    );

    await cart.save();
    await cart.populate("items.course");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const clear = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.json({ items: [] });

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const merge = async (req, res) => {
  const { guestCart } = req.body; // array of courseCodes

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    for (let courseCode of guestCart) {
      const course = await Course.findOne({ courseCode });
      if (!course) continue;

      const existingItem = cart.items.find(
        i => i.course.toString() === course._id.toString()
      );

      if (existingItem) existingItem.quantity += 1;
      else cart.items.push({ course: course._id });
    }

    await cart.save();
    await cart.populate("items.course");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  get,
  add,
  remove,
  clear,
  merge
};

const Cart = require("../models/cartModel");
const Course = require("../models/courseModel");

const get = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.course",
    );
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const add = async (req, res) => {
  const { courseCode, packageType, quantity = 1 } = req.body;

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!courseCode || !packageType) {
      return res
        .status(400)
        .json({ message: "courseCode and packageType are required" });
    }

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const course = await Course.findOne({ courseCode });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const packageData = course.tabData[packageType];
    if (!packageData) {
      return res.status(400).json({ message: "Selected package not found" });
    }
    if (packageData.price === undefined) {
      return res
        .status(400)
        .json({ message: "Selected package price missing" });
    }

    const price = packageData.price;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (i) =>
        i.course.toString() === course._id.toString() &&
        i.packageType === packageType,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].total =
        cart.items[itemIndex].quantity * cart.items[itemIndex].price;
    } else {
      cart.items.push({
        course: course._id,
        packageType,
        quantity,
        price,
        total: price * quantity,
      });
    }

    await cart.save();
    await cart.populate("items.course");

    res.status(200).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to add item to cart" });
  }
};

const remove = async (req, res) => {
  const { courseId, packageType } = req.body;

  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });
    if (!courseId || !packageType)
      return res
        .status(400)
        .json({ message: "courseId and packageType are required" });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) =>
        !(i.course.toString() === courseId && i.packageType === packageType),
    );

    await cart.save();
    await cart.populate("items.course");

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Remove Item Error:", err);
    res.status(500).json({ error: err.message || "Failed to remove item" });
  }
};

const update = async (req, res) => {
  const { courseId, packageType, quantity } = req.body;

  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });
    if (!courseId || !packageType || quantity === undefined)
      return res
        .status(400)
        .json({ message: "courseId, packageType, and quantity are required" });

    if (quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (i) => i.course.toString() === courseId && i.packageType === packageType,
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found in cart" });

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = quantity * cart.items[itemIndex].price;

    await cart.save();
    await cart.populate("items.course");

    res.status(200).json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("Update Quantity Error:", err);
    res.status(500).json({ error: err.message || "Failed to update cart" });
  }
};

const clear = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    console.error("Clear Cart Error:", err);
    res.status(500).json({ error: err.message || "Failed to clear cart" });
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
        (i) => i.course.toString() === course._id.toString(),
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
  update,
  clear,
  merge,
};

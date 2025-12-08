const CourseCategory = require("../models/categoryModel");

const create = async (req, res) => {
  try {
    const category = new CourseCategory(req.body);
    const savedCategory = await category.save();
    res.status(201).json({
      success: true,
      message: "Course category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course category",
      error: error.message,
    });
  }
};

const get = async (req, res) => {
  try {
    const categories = await CourseCategory.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course categories",
      error: error.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const category = isObjectId
      ? await CourseCategory.findById(idOrSlug)
      : await CourseCategory.findOne({ slug: idOrSlug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Course category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course category",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await CourseCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Course category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course category",
      error: error.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await CourseCategory.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Course category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course category",
      error: error.message,
    });
  }
};

module.exports = {
  create,
  get,
  getById,
  update,
  remove,
};

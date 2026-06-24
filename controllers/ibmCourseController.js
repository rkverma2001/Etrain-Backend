const IBMCourse = require("../models/ibmCourseModel");

/**
 * Create Course
 */
const createCourse = async (req, res) => {
  try {
    const existingCourse = await IBMCourse.findOne({
      slug: req.body.slug,
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course slug already exists",
      });
    }

    const course = await IBMCourse.create(req.body);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Courses
 */
const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, featured, status } = req.query;

    const filter = {};

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (status !== undefined) {
      filter.status = status === "true";
    }

    const courses = await IBMCourse.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await IBMCourse.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Course By Slug
 */
const getCourseBySlug = async (req, res) => {
  try {
    const course = await IBMCourse.findOne({
      slug: req.params.slug,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Course
 */
const updateCourse = async (req, res) => {
  try {
    const course = await IBMCourse.findOneAndUpdate(
      {
        slug: req.params.slug,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Course
 */
const deleteCourse = async (req, res) => {
  try {
    const course = await IBMCourse.findOneAndDelete({
      slug: req.params.slug,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Search IBM Courses
 */
const searchCourses = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const regex = new RegExp(q, "i");

    const courses = await IBMCourse.find({
      $or: [
        { title: regex },
        { subtitle: regex },
        { description: regex },
        { slug: regex },
        { skills: regex },
        { level: regex },
      ],
      status: true,
    });

    res.status(200).json({
      success: true,
      total: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Featured Courses
 */
const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await IBMCourse.find({
      featured: true,
      status: true,
    });

    res.status(200).json({
      success: true,
      total: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  searchCourses,
  getFeaturedCourses,
};

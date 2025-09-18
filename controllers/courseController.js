const Course = require("../models/courseModel");

const create = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const get = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getByCode = async (req, res) => {
  try {
    const course = await Course.findOne({ courseCode: req.params.code });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { courseCode: req.params.code },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      courseCode: req.params.code,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const search = async (req, res) => {
  try {
    const { q } = req.query; // search keyword

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Case-insensitive search using regex
    const courses = await Course.find({
      $or: [
        { courseName: { $regex: q, $options: "i" } },
        { courseCode: { $regex: q, $options: "i" } },
        { highlights: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  get,
  getByCode,
  update,
  remove,
  search,
};

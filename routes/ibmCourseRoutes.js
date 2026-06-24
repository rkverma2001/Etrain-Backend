const express = require("express");

const router = express.Router();

const {
  createCourse,
  getCourses,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  searchCourses,
  getFeaturedCourses,
} = require("../controllers/ibmCourseController");

router.post("/", createCourse);

router.get("/", getCourses);

router.get("/search", searchCourses);

router.get("/featured", getFeaturedCourses);

router.get("/:slug", getCourseBySlug);

router.put("/:slug", updateCourse);

router.delete("/:slug", deleteCourse);

module.exports = router;

const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  duration: String,
  type: String,
});

const courseCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    video: String,
    badges: [String],
    certificateImage: String,
    features: [String],
    options: [
      {
        label: String,
        value: String,
      },
    ],
    courses: [courseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseCategory", courseCategorySchema);

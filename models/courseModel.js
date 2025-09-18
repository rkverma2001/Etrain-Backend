const mongoose = require("mongoose");

const tabDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String },
  price: { type: Number },
});

const curriculumSchema = new mongoose.Schema({
  question: { type: String, required: true }, // Example: "MODULE 1 | 1 HOUR"
  answers: [{ type: String }], // Example: ["Working in...", "Purpose, Audience..."]
});

const certificateSchema = new mongoose.Schema({
  certifier: { type: String },
  certifierColor: { type: String },
  certificateImg: { type: String },
  bannerImg: { type: String },
});

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },

    tabData: {
      Bundle: tabDataSchema,
      "Exam Voucher": tabDataSchema,
      "Practice Test": tabDataSchema,
      Courseware: tabDataSchema,
    },

    curriculum: [curriculumSchema], // Array of modules

    banner: {
      videoUrl: { type: String },
    },

    video: {
      videoUrl: { type: String },
    },

    highlights: [{ type: String }],

    certificate: certificateSchema,

    // New fields
    syllabus: { type: String }, // e.g., PDF or webpage link
    practiceTestLink: { type: String }, // external practice test link
    coursewareLink: { type: String }, // external courseware link
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);

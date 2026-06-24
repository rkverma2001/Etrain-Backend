const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const ibmCourseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    provider: {
      type: String,
      default: "IBM Skills Network Professional Course",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      required: true,
      trim: true,
    },

    effort: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    rating: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    heroImage: {
      type: String,
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    overview: [
      {
        type: String,
        trim: true,
      },
    ],

    modules: [moduleSchema],

    instructor: {
      type: instructorSchema,
      required: true,
    },

    certificateOffered: {
      type: Boolean,
      default: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: Boolean,
      default: true,
      index: true,
    },

    ctaTitle: {
      type: String,
      trim: true,
    },

    ctaDescription: {
      type: String,
      trim: true,
    },

    seoTitle: {
      type: String,
      trim: true,
    },

    seoDescription: {
      type: String,
      trim: true,
    },

    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("IBMCourse", ibmCourseSchema);

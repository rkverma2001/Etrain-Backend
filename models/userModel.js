const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      default: "",
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\+91[6-9]\d{9}$/,
        "Please enter a valid Indian mobile number with +91",
      ],
    },

    userType: {
      type: String,
      enum: ["Student", "Freelancer", "Trainer", "WorkingProfessional"],
      default: "Student",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);

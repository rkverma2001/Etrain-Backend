const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  certificateUrl: String,
  issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certificate", certificateSchema);

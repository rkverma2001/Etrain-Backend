const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  scheduledDate: Date,
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  score: Number,
  certificateIssued: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false }
});

module.exports = mongoose.model("Exam", examSchema);

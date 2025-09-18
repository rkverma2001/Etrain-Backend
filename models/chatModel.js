const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isAI: { type: Boolean, default: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  messages: [
    {
      sender: { type: String, enum: ["user", "bot", "agent"] },
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);

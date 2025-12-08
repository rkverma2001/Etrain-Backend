const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        packageType: {
          type: String,
          enum: ["Bundle", "Exam Voucher", "Practice Test", "Courseware"],
          required: true,
        },
        quantity: { 
          type: Number, 
          default: 1 
        },
        price: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);

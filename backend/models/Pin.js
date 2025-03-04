const mongoose = require("mongoose");

const PinSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
      min: 3,
      max: 60,
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Wallets", "Jewelry", "Keys", "Documents", "Others"],
    },
    desc: {
      type: String,
      required: true,
      min: 3,
    },
    contactno: {
      type: String,
      required: true,
    },
    imgurl: {
      type: String,
      default: null,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", PinSchema);

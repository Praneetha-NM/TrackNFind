// models/Found.js

const mongoose = require("mongoose");

const FoundSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    contactno: {
      type: String,
      required: true,
    },
    imgurl: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    lostBy: {
      type: String,
      required: true, // Store the username of the person who lost the item
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt timestamps
);

module.exports = mongoose.model("Found", FoundSchema);
// routes/found.js

const router = require("express").Router();
const Found = require("../models/Found");

// Create a new found item
router.post("/", async (req, res) => {
  const newFound = new Found(req.body);
  try {
    const savedFound = await newFound.save();
    res.status(200).json(savedFound);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all found items
router.get("/", async (req, res) => {
  try {
    const foundItems = await Found.find();
    res.status(200).json(foundItems);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
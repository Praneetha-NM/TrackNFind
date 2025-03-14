const router = require("express").Router();
const Pin = require("../models/Pin");

//create a pin
router.post("/", async (req, res) => {
  console.log("Received request body:", req.body)
  const newPin = new Pin(req.body);
  try {
    const savedPin = await newPin.save();
    res.status(200).json(savedPin);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

//get all pins
router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find();
    res.status(200).json(pins);
  } catch (err) {
    res.status(500).json(err);
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const deletedPin = await Pin.findByIdAndDelete(req.params.id);
    if (!deletedPin) {
      return res.status(404).json({ message: "Pin not found" });
    }
    res.json({ message: "Pin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting pin", error });
  }
});


module.exports = router;

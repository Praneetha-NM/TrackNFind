const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

///REGISTER
router.post("/register", async (req, res) => {
  console.log("Register route hit");
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create the new user object
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,  // Store the hashed password
    });

    console.log("Received data:", newUser);

    // Save the user to the database
    const user = await newUser.save();
    res.status(200).json(user._id);  // Send user ID as the response
  } catch (err) {
    console.log("Error in registration:", err); 
    if (err.code === 11000) {
      return res.status(400).json("Username or email already exists!");
    }
    
    // Handle other errors and return error details
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
      stack: err.stack,  // Log stack trace
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body);

    // Find user
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      console.log("User not found");
      return res.status(400).json("Wrong username or password");
    }
    
    console.log("User found:", user.username);

    // Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      console.log("Invalid password for user:", user.username);
      return res.status(400).json("Wrong username or password");
    }

    console.log("Login successful for user:", user.username);

    // Send response
    return res.status(200).json({ _id: user._id, username: user.username });
    
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

module.exports = router;

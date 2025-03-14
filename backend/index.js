const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const pinRoute = require("./routes/pins");
const foundRoute = require("./routes/found");
const cors = require("cors");


dotenv.config();

app.use(express.json());
app.use(cors({ origin: "*" })); 

mongoose 
 .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,   })   
 .then(() => console.log("MongoDB connected!"))
 .catch(err => console.log(err));

app.use("/api/users", userRoute);
app.use("/api/pins", pinRoute);
app.use("/api/found", foundRoute);

app.listen(8800, () => {
  console.log("Backend server is running!");
});

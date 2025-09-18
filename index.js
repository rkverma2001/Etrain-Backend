const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const router = require("./routes/index");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/check", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", router);

app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
  }).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

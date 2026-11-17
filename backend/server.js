const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Welcome to BookNest Backend!");
});

// Start server
app.listen(5000, () => {
    console.log("BookNest server running on port 5000");
});
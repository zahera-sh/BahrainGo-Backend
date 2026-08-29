// Imports
const express = require("express"); // importing express package
const app = express(); // creates a express application
const dotenv = require("dotenv").config(); // this allows me to use my .env values in this file
const morgan = require("morgan");
const cors = require("cors");


// Routes Import
const authRoutes = require("./routes/auth.routes");
const challengeRoutes = require("./routes/challenge.routes");
const inviteRoutes = require("./routes/invite.routes");
const participantRoutes = require("./routes/participant.routes");


// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    })
);
app.use(express.json());
app.use(morgan("dev"));


// Routes
app.use("/auth", authRoutes);
app.use("/challenges", challengeRoutes);
app.use("/invites", inviteRoutes);
app.use("/participants", participantRoutes);


module.exports = app;
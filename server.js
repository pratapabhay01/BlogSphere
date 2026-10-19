const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Import Routes
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to BlogSphere API!");
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        message: "BlogSphere API is running!",
        status: "success"
    });
});

// Start Server and Connect MongoDB
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");

        app.listen(PORT, () => {
            console.log(`BlogSphere server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Startup Error:", error.message);
        process.exit(1);
    }
}

startServer();
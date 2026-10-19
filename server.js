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
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        message: "BlogSphere API is running!",
        status: "success"
    });
});

// Connect to MongoDB once and reuse the connection
let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is missing");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI).catch((error) => {
            connectionPromise = null;
            throw error;
        });
    }

    await connectionPromise;
}

// Ensure MongoDB is connected before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Export app for Vercel
module.exports = app;

// Run a local server when developing on your computer
if (require.main === module) {
    const PORT = process.env.PORT || 3000;

    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`BlogSphere server running at http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Startup Error:", error.message);
            process.exit(1);
        });
}
const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all blogs
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name")
            .populate("comments.user", "name")
            .sort({ createdAt: -1 });

        res.json(blogs);
    } catch (error) {
        console.error("Fetch blogs error:", error.message);

        res.status(500).json({
            message: "Failed to fetch blogs"
        });
    }
});

// Get a single blog
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate("author", "name")
            .populate("comments.user", "name");

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);
    } catch (error) {
        res.status(400).json({
            message: "Invalid blog ID"
        });
    }
});

// Create a blog
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const blog = await Blog.create({
            title: title.trim(),
            content: content.trim(),
            author: req.user.id
        });

        res.status(201).json({
            message: "Blog created successfully",
            blog
        });
    } catch (error) {
        console.error("Create blog error:", error.message);

        res.status(500).json({
            message: "Failed to create blog"
        });
    }
});

// Edit your own blog
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only edit your own blogs"
            });
        }

        blog.title = title.trim();
        blog.content = content.trim();

        await blog.save();

        res.json({
            message: "Blog updated successfully",
            blog
        });
    } catch (error) {
        console.error("Update blog error:", error.message);

        res.status(400).json({
            message: "Failed to update blog"
        });
    }
});

// Delete your own blog
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own blogs"
            });
        }

        await blog.deleteOne();

        res.json({
            message: "Blog deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Failed to delete blog"
        });
    }
});

// Add a comment
router.post("/:id/comments", authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        if (text.trim().length > 1000) {
            return res.status(400).json({
                message: "Comment cannot exceed 1000 characters"
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        blog.comments.push({
            user: req.user.id,
            text: text.trim()
        });

        await blog.save();

        await blog.populate("comments.user", "name");

        res.status(201).json({
            message: "Comment added successfully",
            comments: blog.comments
        });
    } catch (error) {
        console.error("Add comment error:", error.message);

        res.status(400).json({
            message: "Failed to add comment"
        });
    }
});

module.exports = router;
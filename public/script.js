const API_URL = "/api";

let authMode = "login";
let currentUser = null;
let authToken = localStorage.getItem("blogSphereToken");

const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");
const authMessage = document.getElementById("authMessage");
const nameGroup = document.getElementById("nameGroup");
const loginNavBtn = document.getElementById("loginNavBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("authSection");
const createSection = document.getElementById("createSection");
const blogForm = document.getElementById("blogForm");
const blogMessage = document.getElementById("blogMessage");
const blogsContainer = document.getElementById("blogsContainer");

// Escape HTML to safely display user-generated content
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function showMessage(element, message, success = false) {
    element.textContent = message;
    element.style.color = success ? "#16803c" : "#d93025";
}

// API helper
async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && authToken) {
            // Clear invalid or expired sessions
            authToken = null;
            currentUser = null;
            localStorage.removeItem("blogSphereToken");
            updateNavigation();
        }

        throw new Error(data.message || "Request failed.");
    }

    return data;
}

// Authentication form
function updateAuthForm() {
    const isRegister = authMode === "register";

    authTitle.textContent = isRegister
        ? "Create Your Account"
        : "Welcome Back!";

    authSubtitle.textContent = isRegister
        ? "Join BlogSphere and share your stories."
        : "Login to continue your journey.";

    authSubmit.textContent = isRegister
        ? "Create Account"
        : "Login";

    nameGroup.classList.toggle("hidden", !isRegister);

    document.getElementById("name").required = isRegister;

    authSwitch.replaceChildren();

    const message = document.createElement("span");
    message.textContent = isRegister
        ? "Already have an account? "
        : "Don't have an account? ";

    const button = document.createElement("button");
    button.type = "button";
    button.id = "switchAuth";
    button.textContent = isRegister ? "Login" : "Register";

    // One click handler only: fixes the Register/Login toggle
    button.addEventListener("click", () => {
        authMode = authMode === "login" ? "register" : "login";
        authMessage.textContent = "";
        updateAuthForm();
    });

    authSwitch.append(message, button);
}

function updateNavigation() {
    const loggedIn = Boolean(authToken);

    loginNavBtn.classList.toggle("hidden", loggedIn);
    logoutBtn.classList.toggle("hidden", !loggedIn);
    createSection.classList.toggle("hidden", !loggedIn);
    authSection.classList.toggle("hidden", loggedIn);
}

function setLoggedIn(token, user) {
    authToken = token;
    currentUser = user;

    localStorage.setItem("blogSphereToken", token);

    updateNavigation();
    loadBlogs();
}

function logout() {
    authToken = null;
    currentUser = null;

    localStorage.removeItem("blogSphereToken");

    authMode = "login";
    updateAuthForm();
    updateNavigation();

    showMessage(authMessage, "You have logged out successfully.", true);
    loadBlogs();
}

loginNavBtn.addEventListener("click", () => {
    authSection.classList.remove("hidden");
    authSection.scrollIntoView({ behavior: "smooth" });
});

logoutBtn.addEventListener("click", logout);

// Register and login
authForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (authMode === "register" && !name) {
        showMessage(authMessage, "Please enter your full name.");
        return;
    }

    const endpoint = authMode === "register"
        ? "/auth/register"
        : "/auth/login";

    const body = authMode === "register"
        ? { name, email, password }
        : { email, password };

    authSubmit.disabled = true;
    authSubmit.textContent = "Please wait...";

    try {
        const data = await apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(body)
        });

        if (authMode === "register") {
            authMode = "login";
            updateAuthForm();

            document.getElementById("email").value = email;
            document.getElementById("password").value = "";

            showMessage(
                authMessage,
                "Account created successfully! Please log in.",
                true
            );
        } else {
            setLoggedIn(data.token, data.user);
            authForm.reset();

            showMessage(
                blogMessage,
                `Welcome back, ${data.user.name}!`,
                true
            );

            createSection.scrollIntoView({ behavior: "smooth" });
        }
    } catch (error) {
        showMessage(authMessage, error.message);
    } finally {
        authSubmit.disabled = false;
        authSubmit.textContent = authMode === "register"
            ? "Create Account"
            : "Login";
    }
});

// Load all blogs
async function loadBlogs() {
    blogsContainer.innerHTML = "<p>Loading stories...</p>";

    try {
        const data = await apiRequest("/blogs");
        const blogs = Array.isArray(data) ? data : data.blogs;

        if (!Array.isArray(blogs) || blogs.length === 0) {
            blogsContainer.innerHTML =
                "<p>No blogs yet. Be the first to share a story!</p>";
            return;
        }

        blogsContainer.innerHTML = blogs.map(blog => {
            const blogId = escapeHTML(blog._id);
            const title = escapeHTML(blog.title);
            const content = escapeHTML(blog.content);
            const author = escapeHTML(
                blog.author?.name || "Community Member"
            );

            const date = blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString()
                : "";

            const comments = Array.isArray(blog.comments)
                ? blog.comments
                : [];

            const authorId = blog.author?._id?.toString();

            const isOwner = Boolean(
                currentUser &&
                authorId &&
                (
                    authorId === currentUser.id ||
                    authorId === currentUser._id
                )
            );

            const actionButtons = isOwner
                ? `
                    <div class="blog-actions">
                        <button type="button"
                            data-action="edit"
                            data-id="${blogId}">Edit</button>

                        <button type="button"
                            data-action="delete"
                            data-id="${blogId}">Delete</button>
                    </div>
                `
                : "";

            const commentsHTML = comments.map(comment => `
                <div class="comment">
                    <strong>${escapeHTML(
                        comment.user?.name || "Community Member"
                    )}</strong>
                    <span>${escapeHTML(comment.text)}</span>
                </div>
            `).join("");

            const commentFormHTML = authToken
                ? `
                    <form class="comment-form" data-id="${blogId}">
                        <input type="text"
                            name="text"
                            maxlength="1000"
                            placeholder="Write a comment..."
                            required>

                        <button type="submit">Send</button>
                    </form>
                `
                : `<p class="blog-meta">Login to join the conversation.</p>`;

            return `
                <article class="blog-card">
                    <h3>${title}</h3>

                    <p class="blog-content">${content}</p>

                    <p class="blog-meta">
                        By ${author} · ${escapeHTML(date)}
                    </p>

                    ${actionButtons}

                    <div class="comments">
                        <h4>Comments (${comments.length})</h4>

                        ${commentsHTML ||
                            '<p class="blog-meta">No comments yet.</p>'}

                        ${commentFormHTML}
                    </div>
                </article>
            `;
        }).join("");
    } catch (error) {
        blogsContainer.replaceChildren();

        const message = document.createElement("p");
        message.textContent = error.message || "Unable to load blogs.";

        blogsContainer.appendChild(message);
    }
}

// Create a blog
blogForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = document.getElementById("blogTitle").value.trim();
    const content = document.getElementById("blogContent").value.trim();

    if (!title || !content) {
        showMessage(blogMessage, "Please enter both title and content.");
        return;
    }

    const publishButton = blogForm.querySelector('button[type="submit"]');
    publishButton.disabled = true;

    try {
        await apiRequest("/blogs", {
            method: "POST",
            body: JSON.stringify({ title, content })
        });

        blogForm.reset();

        showMessage(blogMessage, "Your blog has been published!", true);

        await loadBlogs();

        document.getElementById("blogs").scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        showMessage(blogMessage, error.message);
    } finally {
        publishButton.disabled = false;
    }
});

// Edit and delete blogs
blogsContainer.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const blogId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "delete") {
        if (!confirm("Are you sure you want to delete this blog?")) {
            return;
        }

        button.disabled = true;

        try {
            await apiRequest(`/blogs/${blogId}`, {
                method: "DELETE"
            });

            await loadBlogs();
        } catch (error) {
            alert(error.message);
            button.disabled = false;
        }
    }

    if (action === "edit") {
        const card = button.closest(".blog-card");

        const newTitle = prompt(
            "Enter the updated title:",
            card.querySelector("h3").textContent
        );

        if (newTitle === null) return;

        const newContent = prompt(
            "Enter the updated content:",
            card.querySelector(".blog-content").textContent
        );

        if (newContent === null) return;

        if (!newTitle.trim() || !newContent.trim()) {
            alert("Title and content cannot be empty.");
            return;
        }

        try {
            await apiRequest(`/blogs/${blogId}`, {
                method: "PUT",
                body: JSON.stringify({
                    title: newTitle.trim(),
                    content: newContent.trim()
                })
            });

            await loadBlogs();
        } catch (error) {
            alert(error.message);
        }
    }
});

// Add comments
blogsContainer.addEventListener("submit", async event => {
    const form = event.target.closest(".comment-form");

    if (!form) return;

    event.preventDefault();

    const input = form.querySelector('input[name="text"]');
    const text = input.value.trim();

    if (!text) return;

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    try {
        await apiRequest(`/blogs/${form.dataset.id}/comments`, {
            method: "POST",
            body: JSON.stringify({ text })
        });

        await loadBlogs();
    } catch (error) {
        alert(error.message);
        button.disabled = false;
    }
});

// Restore saved session
async function restoreSession() {
    if (authToken) {
        try {
            // Verify the saved token using an authenticated endpoint.
            // The blogs endpoint itself is public, so it cannot verify a token.
            // Restore token availability, but identity is unknown until login.
            currentUser = null;

            updateNavigation();
        } catch (error) {
            console.error("Session restoration failed:", error);
            logout();
        }
    } else {
        updateNavigation();
    }

    await loadBlogs();
}

updateAuthForm();
restoreSession();
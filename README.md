# 🌐 BlogSphere — Blogging Platform

A full-stack blogging platform where users can create, read, edit, and delete blog posts and interact through comments.

## ✨ Features

* 🔐 **User Authentication** — Secure registration and login.
* 📝 **Create Blogs** — Publish blog posts.
* 📖 **Read Blogs** — Explore published content.
* ✏️ **Edit Blogs** — Update your own posts.
* 🗑️ **Delete Blogs** — Remove your own posts.
* 💬 **Comments** — Interact with blog posts through comments.
* 🛡️ **Protected Routes** — JWT-based authentication and authorization.
* 🗄️ **Database Integration** — Store users and blog posts using MongoDB.
* 📱 **Responsive Interface** — HTML, CSS, and JavaScript frontend.

## 🛠️ Tech Stack

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| HTML5      | Page structure                |
| CSS3       | Styling and responsive layout |
| JavaScript | Frontend functionality        |
| Node.js    | JavaScript runtime            |
| Express.js | Backend API and routing       |
| MongoDB    | Database                      |
| Mongoose   | Database modeling             |
| JWT        | Authentication                |
| bcrypt     | Password hashing              |

## 📂 Project Structure

```text
BlogSphere/
├── middleware/
│   └── auth.js
├── models/
│   ├── Blog.js
│   └── User.js
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── routes/
│   ├── auth.js
│   └── blogs.js
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## ⚙️ Installation and Setup

### Prerequisites

* Node.js and npm
* MongoDB Atlas account or a MongoDB instance
* Git

### 1. Clone the repository

```bash
git clone https://github.com/pratapabhay01/BlogSphere.git
cd BlogSphere
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the variables expected by your application.

Example:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
```

**Important:** Use the exact environment variable names expected by your code. Never upload your `.env` file or expose database credentials and JWT secrets publicly.

### 4. Start the application

```bash
npm run dev
```

If your project does not define a `dev` script, use the appropriate start command from `package.json`.

### 5. Open the application

Visit:

```text
http://localhost:3000
```

## 🔒 Security

* Passwords are hashed before storage.
* Protected endpoints require authentication.
* Environment variables are used for sensitive configuration.
* The `.env` file should remain excluded from Git.

## 🚀 Deployment

The application can be deployed using a Node.js-compatible hosting platform with access to your configured MongoDB database.

Deployment instructions and the live application URL will be added after deployment.

## 👨‍💻 Author

**Abhay Pratap**

* GitHub: [@pratapabhay01](https://github.com/pratapabhay01)
* Project Repository: [BlogSphere](https://github.com/pratapabhay01/BlogSphere)

---

⭐ If you find this project useful, consider starring the repository.

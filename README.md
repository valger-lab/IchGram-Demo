# 📸 IchGram — Social Media App (Demo Version)

**IchGram** is a lightweight full-stack social media application built using the **MERN stack**:  
React (frontend), Node.js + Express (backend), and MongoDB (database).

> ⚠️ This is a **demo version**. Some features are disabled for demonstration purposes.  
> Users can browse, like posts, comment, and send messages — but cannot register, edit profiles, or upload content.

---

## 🚀 Features (Demo Enabled ✅ / Disabled ❌)

| Feature                  | Status              |
| ------------------------ | ------------------- |
| 🔐 User login            | ✅ Guest login only |
| 📝 User registration     | ❌ Disabled         |
| 🖼 Upload posts           | ❌ Disabled         |
| ❤️ Likes                 | ✅ Enabled          |
| 💬 Comments              | ✅ Enabled          |
| 🧑‍🤝‍🧑 Follow users          | ❌ Disabled         |
| 🔔 Notifications         | ✅ Read-only        |
| 💬 Messaging (Socket.IO) | ✅ Enabled          |
| ⚙️ Edit profile / avatar | ❌ Disabled         |
| ☁️ Cloudinary media      | ✅ Enabled          |

---

## 🧰 Tech Stack

- **Frontend**: React, Vite, React Router, Axios, TailwindCSS
- **Backend**: Node.js, Express, Mongoose, JWT, Bcrypt, Multer
- **Database**: MongoDB (Atlas)
- **Real-time**: Socket.IO
- **Media Hosting**: Cloudinary

---

## 📦 Getting Started (Development)

> 📝 Requires **Node.js v18+** and **MongoDB** (local or Atlas).  
> ⚠️ Demo mode is controlled via environment variables.

### 🔧 1. Clone the Repository

```bash
git clone https://github.com/valger-lab/PR_IchGram.git
cd PR_IchGram

⚙️ 2. Setup Environment Variables

Create a .env file in the /backend directory:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Demo mode enabled
IS_DEMO=true

▶️ 3. Install Dependencies & Run

cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev


💡 Notes
This demo is read-only in key areas to prevent unauthorized content uploads or abuse.
You’re free to clone and modify the project for educational or portfolio purposes.


## License

This project is licensed under the [MIT License](./LICENSE).
```

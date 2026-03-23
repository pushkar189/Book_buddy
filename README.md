# 📚 Book Buddy

Book Buddy is a full-stack reading tracker application designed to help you organize your reading journey. Keep track of your wishlist, monitor books you're currently reading by percentage, and rate/review the books you've completed!

![Architecture](https://img.shields.io/badge/Architecture-Client%20%2F%20Server-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Database](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57?logo=sqlite)

## ✨ Features
* **Library Management:** Add books with their Title, Author, and Genre.
* **Status Tracking:** Categorize books into exactly where they belong:
  * 🎯 *Wishlist*: Books you want to read.
  * 📖 *Reading*: Track your exact percentage progress.
  * ✅ *Completed*: Rate it out of 5 stars and save permanent notes/reviews!
* **Visual Statistics:** Get a clear breakdown of your reading habits, top genres, and average reading progress.
* **Instant filtering:** Instantly update reading progress within the app interface.
* **Automated Data Normalization:** Enforces data consistency (e.g., jumping to 'Completed' automatically sets progress to 100%).

## 🛠️ Tech Stack

### Frontend
- **React 18** (via Vite)
- **Vanilla CSS** with a custom, sleek design system.
- *Currently managing offline persistence via localStorage (Backend integration in development!)*

### Backend
- **FastAPI** for blisteringly fast API routing.
- **SQLAlchemy** (ORM) & **SQLite** for lightweight, robust data persistence.
- **Pydantic** for rigorous data validation and schema definitions.
- **Uvicorn** ASGI server.

## 🚀 Getting Started

Follow these steps to run the complete Book Buddy ecosystem locally!

### 1. Start the Backend API (FastAPI)
The backend requires Python 3.9+. It handles all the database connectivity via port 8080.

```bash
# 1. Navigate to the project root directory
cd Book_buddy

# 2. (Optional) Create and activate a Virtual Environment
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Mac/Linux

# 3. Install the dependencies
pip install -r backend/requirements.txt

# 4. Start the Uvicorn server (MUST be run from the root directory)
python -m uvicorn backend.main:app --reload --port 8080
```
*The API will be available at `http://localhost:8080`.*
*Interactive API Docs: `http://localhost:8080/docs`.*

### 2. Start the Frontend Application (React)
The frontend requires Node.js (v16+).

```bash
# 1. Open a new terminal window!

# 2. Navigate to the frontend directory
cd Book_buddy/frontend

# 3. Install NPM dependencies
npm install

# 4. Start the Vite development server
npm run dev
```
*The UI will spin up locally, usually at `http://localhost:5173`. Click the link in your terminal to view it!*

## 🌐 API Reference

If you wish to interact directly with the backend database, these are the exposed endpoints:

| Endpoints | Methods | Description |
|-----------|---------|-------------|
| `/health` | `GET` | Server health check. |
| `/books` | `GET` | Retrieve the entire library of books. |
| `/books` | `POST` | Create a new book. |
| `/books/{book_id}` | `PUT` | Update an existing book's progress, status, or rating. |
| `/books/{book_id}` | `DELETE` | Remove a book from the library completely. |
| `/stats` | `GET` | Get advanced reading statistics (completion rate, genres, averages). |

## 🤝 Contributing
Contributions are always welcome. Just fork this repository, make your modifications, and issue a Pull Request!
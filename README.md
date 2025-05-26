# 🧠 Vision Board – A Multi-Tool React App

A feature-rich **React** project built to explore modern React concepts and tools including **React Router**, **Redux Toolkit**, and **Canvas API**. It combines a notes saver, a todo manager, and a drawing app – all stored locally using the browser’s `localStorage`.

🔗 **Live Demo:** (https://vision-board-beryl.vercel.app/)

---

## 🚀 Technologies Used

- ⚛️ **React** (Functional components with hooks)
- 🌐 **React Router DOM** – for route-based navigation
- 🧰 **Redux Toolkit** – for centralized state management
- 🖼️ **Canvas API** – for the drawing interface
- 💾 **localStorage** – for persisting notes, todos, and drawings

---

## 🧭 Available Routes / Tools

### 📝 1. Notes Saver (`/notes`)
A simple yet powerful utility to save and manage different types of text content.

**Features:**
- Create notes with **headers**
- Supports **text**, **code**, or **JSON** format
- View **creation date**
- Actions: `view`, `edit`, `delete`, `copy`, and `share`
- **Search** functionality for past notes
- All notes stored in **localStorage**

---

### ✅ 2. Todo App (`/todos`)
A clean and basic task manager to track your to-dos.

**Features:**
- Create and manage **todo items**
- **Mark as complete**, **edit**, or **delete**
- Filter and view **completed tasks**
- Persistent via **localStorage**

---

### 🎨 3. Drawing App (`/draw`)
A fun and functional sketching tool built with the HTML5 Canvas API.

**Tools Available:**
- ✏️ **Pencil**
- 🟥 **Rectangle (Shape)**
- 📏 **Straight Line**
- ✍️ **Text**
- 🤚 **Move tool**
- 🧽 **Eraser**

**Customization Options:**
- 🎨 **4 Colors**
- 📏 **3 Thickness levels**
- 🔄 **Undo / Redo**
- 💾 **Save to localStorage**
- ❌ **Clear canvas (from storage)**

---

## 🗂️ Project Structure

src/
├── components/ # Reusable UI components
├── features/ # Notes, Todos, Draw separated by feature
│ ├── notes/
│ ├── todos/
│ └── draw/
├── redux/ # Redux slices and store config
├── App.jsx # Route definitions
└── main.jsx # Entry point

---

## 🧠 Learning Highlights

This project helped reinforce:

- Structuring a scalable **React app**
- Implementing **multi-route SPAs**
- Using **Redux Toolkit** for modular, clean state logic
- Integrating **Canvas** in React with state-driven tools
- Saving user data with **localStorage**
- Creating a polished, functional UI with good UX

---

## 🛠️ Setup Instructions

```bash
git clone https://github.com/your-username/vision-board.git
cd vision-board
npm install
npm run dev
```
📌 Future Improvements
Export notes/drawings to files

Tagging and filtering for notes

Drawing history timeline

Multi-user or cloud storage integration

💡 Author Notes
This project was built as a hands-on learning journey in mastering React, Redux Toolkit, and modern frontend practices. It's a foundation for more complex, full-stack apps.

Feel free to fork, contribute, or use parts of the code in your own projects!

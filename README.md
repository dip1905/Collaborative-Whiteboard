# 🧑‍🤝‍🧑 Collaborative Whiteboard (MERN + Socket.IO)

A real-time collaborative whiteboard application built with the MERN stack and WebSockets (Socket.IO).

## 🚀 Features

- Join or create rooms using 6+ character codes (no auth needed)
- Real-time drawing with:
  - Smooth pencil strokes (mouse/touch)
  - Adjustable stroke width
  - Basic color palette
  - Clear canvas button
- Real-time cursor tracking
- Color-coded cursors for each user
- Inactive cursors auto-hide after 10s
- Display number of active users
- Leave room button
- Responsive UI for desktop/tablet
- Inactive rooms cleaned up after 24h

---

## ⚙️ Technologies

| Layer     | Stack              |
|-----------|--------------------|
| Frontend  | React.js (CRA), CSS |
| Backend   | Node.js, Express.js |
| Database  | MongoDB             |
| Realtime  | Socket.IO           |

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/whiteboard-collab.git
cd whiteboard-collab
```

### 2. Start the Backend

```bash
cd server
npm install
npm start
```

The backend will run on: `http://localhost:5000`

Make sure MongoDB is running locally (`mongodb://localhost:27017/whiteboard`)

### 3. Start the Frontend

```bash
cd client
npm install
npm start
```

Frontend will open in your browser at: `http://localhost:3000`

---

## 📡 REST API Endpoints

| Method | Endpoint             | Description             |
|--------|----------------------|-------------------------|
| POST   | `/api/rooms/create`  | Create a new room       |
| POST   | `/api/rooms/join`    | Join an existing room   |
| GET    | `/api/rooms/:roomId` | Fetch room information  |

---

## 🎯 Socket.IO Events

### Client → Server

| Event         | Payload                              |
|---------------|---------------------------------------|
| `join-room`   | `{ roomId }`                          |
| `leave-room`  | `{ roomId }`                          |
| `draw-start`  | `{ x, y, roomId }`                    |
| `draw-move`   | `{ startX, startY, x, y, color, strokeWidth, roomId }` |
| `draw-end`    | `{ roomId }`                          |
| `cursor-move` | `{ x, y, roomId }`                    |
| `clear-canvas`| `{ roomId }`                          |

### Server → Client

| Event             | Payload                             |
|------------------|--------------------------------------|
| `drawing-history`| Array of drawing commands            |
| `draw-start`     | `{ x, y }`                           |
| `draw-move`      | `{ startX, startY, x, y, color, strokeWidth }` |
| `draw-end`       | `{}`                                 |
| `cursor-update`  | `{ userId, x, y }`                   |
| `user-disconnected` | `userId`                          |
| `clear-canvas`   | `void`                               |
| `update-user-count` | `number`                          |

---

## 🧠 Architecture Overview

```
client/
├── components/
│   ├── App.js
│   ├── RoomJoin.js
│   ├── Whiteboard.js
│   ├── DrawingCanvas.js
│   ├── Toolbar.js
│   ├── UserCursors.js
│   └── socket.js
server/
├── server.js
├── socketServer.js
├── routes/
│   └── roomRoutes.js
├── models/
│   └── Room.js
```

- Frontend connects via Socket.IO for real-time drawing and cursor updates.
- Backend handles socket events and MongoDB storage for drawing history.
- Drawing data is batched and stored efficiently.
- Inactive rooms are deleted after 24 hours using a periodic job.

---

## 🌐 Deployment Guide

### 1. Backend (Node + MongoDB)

- Use a server like **Render**, **Railway**, or **Heroku**.
- Host MongoDB with **MongoDB Atlas**.
- In `server.js`, update MongoDB URI to:

```js
mongoose.connect(process.env.MONGO_URI);
```

### 2. Frontend (React)

- Build frontend:

```bash
cd client
npm run build
```

- Deploy `client/build` to **Vercel**, **Netlify**, or host as static files.

### 3. Hosting Both Together (Optional)

Use Express to serve React's build files:

```js
// Add this in server.js (after routes)
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
```

Then deploy entire project from root.

---

## ✅ Status

All assignment requirements are implemented and verified.

---

## 📅 Deadline

**Submitted before: July 21, 2025 – 11:59 AM**

---

## 👨‍💻 Author

Dipesh Patel – MERN Stack Developer

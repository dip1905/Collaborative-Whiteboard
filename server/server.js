// server/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const roomRoutes = require('./routes/roomRoutes');
const socketHandler = require('./socketServer');


require('dotenv').config();


const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/rooms', roomRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('✅ API Working');
});

// Socket Events
socketHandler(io);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

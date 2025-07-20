const Room = require('./models/Room');

function socketHandler(io) {
  const roomUsers = {};
  const strokeBuffers = {}; // { roomId: { buffer: [], timer: Timeout } }

  // Periodic room cleanup
  setInterval(async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      const result = await Room.deleteMany({ lastActivity: { $lt: cutoff } });
      if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} inactive rooms`);
      }
    } catch (err) {
      console.error('❌ Error cleaning up rooms:', err);
    }
  }, 60 * 60 * 1000); // run hourly

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('join-room', async ({ roomId }) => {
      socket.join(roomId);
      console.log(`👥 User ${socket.id} joined room ${roomId}`);

      if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
      roomUsers[roomId].add(socket.id);

      io.to(roomId).emit('update-user-count', roomUsers[roomId].size);

      try {
        const room = await Room.findOne({ roomId });
        if (room?.drawingData.length > 0) {
          socket.emit('drawing-history', room.drawingData);
        }
      } catch (err) {
        console.error('❌ Error fetching drawing history:', err);
      }
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
      if (roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);
        if (roomUsers[roomId].size === 0) delete roomUsers[roomId];
        else io.to(roomId).emit('update-user-count', roomUsers[roomId].size);
      }
    });

    socket.on('draw-move', ({ roomId, startX, startY, x, y, color, strokeWidth }) => {
      socket.to(roomId).emit('draw-move', { startX, startY, x, y, color, strokeWidth });

      // Batching logic
      if (!strokeBuffers[roomId]) {
        strokeBuffers[roomId] = { buffer: [], timer: null };
      }

      strokeBuffers[roomId].buffer.push({ x: startX, y: startY });
      strokeBuffers[roomId].buffer.push({ x, y });

      if (strokeBuffers[roomId].buffer.length >= 10) {
        flushStrokeBuffer(roomId, color, strokeWidth);
      } else {
        if (strokeBuffers[roomId].timer) clearTimeout(strokeBuffers[roomId].timer);
        strokeBuffers[roomId].timer = setTimeout(() => {
          flushStrokeBuffer(roomId, color, strokeWidth);
        }, 1000);
      }
    });

    const flushStrokeBuffer = async (roomId, color, strokeWidth) => {
      const points = strokeBuffers[roomId]?.buffer;
      if (!points || points.length < 2) return;

      try {
        await Room.findOneAndUpdate(
          { roomId },
          {
            $push: {
              drawingData: {
                type: 'stroke',
                data: { points, color, strokeWidth },
              },
            },
            $set: { lastActivity: new Date() },
          }
        );
      } catch (err) {
        console.error('❌ Error saving stroke batch:', err);
      }

      strokeBuffers[roomId].buffer = [];
    };

    socket.on('clear-canvas', async ({ roomId }) => {
      io.to(roomId).emit('clear-canvas');

      try {
        await Room.findOneAndUpdate(
          { roomId },
          {
            $push: { drawingData: { type: 'clear', data: {} } },
            $set: { lastActivity: new Date() },
          }
        );
      } catch (err) {
        console.error('❌ Error saving clear-canvas:', err);
      }
    });

    socket.on('cursor-move', ({ x, y, roomId }) => {
      socket.to(roomId).emit('cursor-update', { userId: socket.id, x, y });
    });

    socket.on('disconnect', () => {
      for (const roomId in roomUsers) {
        if (roomUsers[roomId].has(socket.id)) {
          roomUsers[roomId].delete(socket.id);
          if (roomUsers[roomId].size === 0) {
            delete roomUsers[roomId];
          } else {
            io.to(roomId).emit('update-user-count', roomUsers[roomId].size);
          }
        }
      }
      socket.broadcast.emit('user-disconnected', socket.id);
    });
  });
}

module.exports = socketHandler;

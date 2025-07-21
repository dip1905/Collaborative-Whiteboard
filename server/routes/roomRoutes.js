const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.post('/create', async (req, res) => {
  const { roomId, roomName } = req.body;

  if (!roomId || roomId.length < 6) {
    return res.status(400).json({ error: 'Invalid room ID (must be at least 6 characters)' });
  }

  try {
    const existingRoom = await Room.findOne({ roomId });

    if (existingRoom) {
      return res.status(400).json({ error: 'Room ID already exists. Try a different one.' });
    }

    const newRoom = new Room({
      roomId,
      roomName: roomName || roomId,
    });

    await newRoom.save();

    res.status(201).json({ success: true, roomId: newRoom.roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating room' });
  }
});

router.post('/join', async (req, res) => {
  const { roomId } = req.body;

  if (!roomId || roomId.length < 6) {
    return res.status(400).json({ error: 'Invalid room ID (must be at least 6 characters)' });
  }

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room does not exist' });
    }

    res.status(200).json({ success: true, roomId: room.roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while joining room' });
  }
});
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;

  if (!roomId || roomId.length < 6) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(200).json({
      success: true,
      roomId: room.roomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      drawingCount: room.drawingData.length,
    });
  } catch (err) {
    console.error('❌ Error fetching room info:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const DrawingCommandSchema = new mongoose.Schema({
  type: { type: String, enum: ['stroke', 'clear'], required: true },
  data: {
    points: [{ x: Number, y: Number }],
    color: String,
    strokeWidth: Number,
  },
  timestamp: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  drawingData: [DrawingCommandSchema],
});

module.exports = mongoose.model('Room', RoomSchema);

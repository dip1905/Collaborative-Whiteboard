// client/src/components/Toolbar.js
import React from 'react';
import { useSocket } from './socket';
import { useParams } from 'react-router-dom';

function Toolbar({ color, setColor, strokeWidth, setStrokeWidth, onClear }) {
  const socket = useSocket(); // ✅ Get the socket
  const { roomId } = useParams(); // ✅ Get the roomId from URL

  const handleClear = () => {
    if (socket && socket.emit) {
      socket.emit('clear-canvas', { roomId }); // ✅ Emit the event to server
    }
    onClear(); // Also update local state (like clearSignal)
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div>
        <label>Color: </label>
        {['black', 'red', 'blue', 'green'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              backgroundColor: c,
              width: 24,
              height: 24,
              borderRadius: '50%',
              margin: '0 4px',
              border: color === c ? '2px solid #000' : 'none'
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <label>Stroke Width: {strokeWidth}</label>
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        />
      </div>
      <button onClick={handleClear} style={{ marginTop: '1rem' }}>
        Clear Canvas
      </button>
    </div>
  );
}

export default Toolbar;

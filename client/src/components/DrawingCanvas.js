import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from './socket';
import { useParams } from 'react-router-dom';
import { throttle } from 'lodash';

function DrawingCanvas({ color, strokeWidth, clearSignal }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: null, y: null });
  const socket = useSocket();
  const { roomId } = useParams();
  const [cursors, setCursors] = useState({});
  const timeoutsRef = useRef({});

  const throttledEmitCursor = useRef(
    throttle((x, y) => {
      if (socket?.emit) {
        socket.emit('cursor-move', { x, y, roomId });
      }
    }, 16) // ~60fps
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.background = '#fff';

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = strokeWidth;
    }
  }, [color, strokeWidth]);

  useEffect(() => {
    if (clearSignal && contextRef.current) {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [clearSignal]);

  useEffect(() => {
    if (!socket) return;

    socket.on('draw-start', ({ x, y }) => {
      const ctx = contextRef.current;
      ctx.beginPath();
      ctx.moveTo(x, y);
    });

    socket.on('draw-move', ({ startX, startY, x, y, color, strokeWidth }) => {
      const ctx = contextRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    socket.on('draw-end', () => { });

    socket.on('drawing-history', (commands) => {
  const ctx = contextRef.current;
  if (!ctx) return;

  commands.forEach((cmd) => {
    if (cmd.type === 'stroke') {
      const { points, color, strokeWidth } = cmd.data;
      if (!points || points.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.stroke();
    } else if (cmd.type === 'clear') {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  });
});


  socket.on('clear-canvas', () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  });

  socket.on('cursor-update', ({ userId, x, y }) => {
    setCursors((prev) => ({ ...prev, [userId]: { x, y } }));

    if (timeoutsRef.current[userId]) {
      clearTimeout(timeoutsRef.current[userId]);
    }

    timeoutsRef.current[userId] = setTimeout(() => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      delete timeoutsRef.current[userId];
    }, 10000); // Inactive after 10s
  });

  socket.on('user-disconnected', (userId) => {
    setCursors((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  });

  return () => {
    socket.off('draw-start');
    socket.off('draw-move');
    socket.off('draw-end');
    socket.off('clear-canvas');
    socket.off('cursor-update');
    socket.off('user-disconnected');
    socket.off('drawing-history');
  };
}, [socket]);

const handleMouseDown = (e) => {
  isDrawing.current = true;
  const x = e.nativeEvent.offsetX;
  const y = e.nativeEvent.offsetY;
  contextRef.current.beginPath();
  contextRef.current.moveTo(x, y);
  lastPos.current = { x, y };

  socket.emit('draw-start', { x, y, roomId });
};

const handleMouseMove = (e) => {
  const x = e.nativeEvent.offsetX;
  const y = e.nativeEvent.offsetY;

  throttledEmitCursor.current(x, y);

  if (!isDrawing.current) return;

  const ctx = contextRef.current;
  const { x: lastX, y: lastY } = lastPos.current;

  if (lastX === null || lastY === null) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  socket.emit('draw-move', {
    roomId,
    startX: lastX,
    startY: lastY,
    x,
    y,
    color,
    strokeWidth,
  });

  lastPos.current = { x, y };
};

const handleMouseUp = () => {
  if (isDrawing.current) {
    socket.emit('draw-end', { roomId });
  }
  isDrawing.current = false;
  lastPos.current = { x: null, y: null };
};

const getTouchPos = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const touch = e.touches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
};

const handleTouchStart = (e) => {
  e.preventDefault();
  isDrawing.current = true;
  const { x, y } = getTouchPos(e);
  contextRef.current.beginPath();
  contextRef.current.moveTo(x, y);
  lastPos.current = { x, y };
  socket.emit('draw-start', { x, y, roomId });
};

const handleTouchMove = (e) => {
  e.preventDefault();
  const { x, y } = getTouchPos(e);

  throttledEmitCursor.current(x, y);

  if (!isDrawing.current) return;

  const ctx = contextRef.current;
  const { x: lastX, y: lastY } = lastPos.current;

  if (lastX === null || lastY === null) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  socket.emit('draw-move', {
    roomId,
    startX: lastX,
    startY: lastY,
    x,
    y,
    color,
    strokeWidth,
  });

  lastPos.current = { x, y };
};

const handleTouchEnd = () => {
  if (isDrawing.current) {
    socket.emit('draw-end', { roomId });
  }
  isDrawing.current = false;
  lastPos.current = { x: null, y: null };
};

return (
  <div style={{ position: 'relative' }}>
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        border: '1px solid #ccc',
        cursor: 'crosshair',
        touchAction: 'none',
      }}
    />

    {Object.entries(cursors).map(([userId, pos]) => (
      <div
        key={userId}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          color: getColorFromId(userId),
          fontSize: '12px',
          background: 'rgba(255,255,255,0.6)',
          padding: '2px 4px',
          borderRadius: '4px',
          border: `1px solid ${getColorFromId(userId)}`,
        }}
      >
        ✛
      </div>
    ))}
  </div>
);
}

const getColorFromId = (userId) => {
  const colors = ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'magenta'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default DrawingCanvas;

import React, { useEffect, useState, useRef } from 'react';

const COLORS = ['red', 'blue', 'green', 'orange', 'purple', 'teal', 'magenta'];

const UserCursors = ({ socket }) => {
  const [cursors, setCursors] = useState({});
  const [userColors, setUserColors] = useState({});
  const timeoutRef = useRef({});

  useEffect(() => {
    socket.on('cursor-update', ({ userId, x, y }) => {
      setCursors((prev) => ({ ...prev, [userId]: { x, y } }));

      setUserColors((prev) => {
        if (!prev[userId]) {
          const used = Object.values(prev);
          const nextColor = COLORS.find((c) => !used.includes(c)) || 'gray';
          return { ...prev, [userId]: nextColor };
        }
        return prev;
      });

      // Reset timeout to hide cursor
      if (timeoutRef.current[userId]) clearTimeout(timeoutRef.current[userId]);
      timeoutRef.current[userId] = setTimeout(() => {
        setCursors((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 10000); // 10 seconds inactivity
    });

    socket.on('user-disconnected', (userId) => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      setUserColors((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    return () => {
      socket.off('cursor-update');
      socket.off('user-disconnected');
    };
  }, [socket]);

  return (
    <>
      {Object.entries(cursors).map(([userId, pos]) => (
        <div
          key={userId}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            fontSize: '14px',
            color: userColors[userId],
            background: 'white',
            border: `1px solid ${userColors[userId]}`,
            borderRadius: '4px',
            padding: '2px 4px',
            zIndex: 1000,
          }}
        >
          ✛
        </div>
      ))}
    </>
  );
};

export default UserCursors;

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toolbar from './Toolbar';
import DrawingCanvas from './DrawingCanvas';
import UserCursors from './UserCursors';
import { useSocket } from './socket';
import ConnectionStatus from './ConnectionStatus';


function Whiteboard() {
    const { roomId } = useParams();
    const socket = useSocket();
    const navigate = useNavigate();
    const [color, setColor] = useState('black');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [clearSignal, setClearSignal] = useState(false);
    const [userCount, setUserCount] = useState(1);

    const handleClear = () => {
        setClearSignal(true);
        setTimeout(() => setClearSignal(false), 200);
        socket.emit('clear-canvas', { roomId });
    };

    const handleLeaveRoom = () => {
        if (socket && roomId) {
            socket.emit('leave-room', { roomId });
        }
        navigate('/'); // Navigate back to homepage or room join page
    };

    // 🔁 Join room on mount
    useEffect(() => {
        socket.emit('join-room', { roomId });

        return () => {
            socket.emit('leave-room', { roomId }); // clean up
        };
    }, [socket, roomId]);

    // 👥 Listen for user count updates
    useEffect(() => {
        socket.on('update-user-count', (count) => {
            setUserCount(count);
        });

        return () => {
            socket.off('update-user-count');
        };
    }, [socket]);

    // 🖱️ Cursor tracking
    useEffect(() => {
        let lastEmit = 0;
        const handleMouseMove = (e) => {
            const now = Date.now();
            if (now - lastEmit > 16) {
                lastEmit = now;
                socket.emit('cursor-move', {
                    roomId,
                    x: e.clientX,
                    y: e.clientY,
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [socket, roomId]);

    return (
        <div className="whiteboard-container" style={{ position: 'relative' }}>
            <ConnectionStatus />
            <button
                onClick={handleLeaveRoom}
                style={{
                    position: 'fixed',
                    top: 10,
                    left: 10,
                    padding: '6px 12px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    zIndex: 9999,
                }}
            >
                Leave Room
            </button>
            <header style={{ padding: '1rem', backgroundColor: '#eee', textAlign: 'center' }}>
                <h2>Room: {roomId}</h2>
                <div className="user-count-display">
                    🟢 {userCount} {userCount === 1 ? 'User' : 'Users'} Online
                </div>
            </header>

            <div style={{ display: 'flex' }}>
                <aside style={{ width: '200px', background: '#f0f0f0' }}>
                    <Toolbar
                        color={color}
                        setColor={setColor}
                        strokeWidth={strokeWidth}
                        setStrokeWidth={setStrokeWidth}
                        onClear={handleClear}
                    />
                </aside>

                <main style={{ flexGrow: 1, position: 'relative' }}>
                    <DrawingCanvas
                        color={color}
                        strokeWidth={strokeWidth}
                        clearSignal={clearSignal}
                    />
                    <UserCursors socket={socket} roomId={roomId} />
                </main>
            </div>
        </div>
    );
}

export default Whiteboard;

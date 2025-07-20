import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RoomJoin() {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!roomId || roomId.length < 6) {
            alert('Enter a valid Room ID (6+ chars)');
            return;
        }

        try {
            const res = await axios.post('http://192.168.31.35:5000/api/rooms/create', { roomId });
            if (res.data.success) {
                navigate(`/whiteboard/${res.data.roomId}`); // ✅ Correct

            }
        } catch (err) {
            alert(err.response?.data?.error || "Error creating room");
        }
    };

    const handleJoin = async () => {
        if (!roomId || roomId.length < 6) {
            alert('Enter a valid Room ID (6+ chars)');
            return;
        }

        try {
            const res = await axios.post('http://192.168.31.35:5000/api/rooms/join', { roomId });
            if (res.data.success) {
                navigate(`/whiteboard/${res.data.roomId}`);
            }
        } catch (err) {
            alert(err.response?.data?.error || "Error joining room");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Enter Room ID</h1>
            <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
            />
            <br /><br />
            <button onClick={handleCreate}>Create Room</button>
            &nbsp;
            <button onClick={handleJoin}>Join Room</button>
        </div>
    );
}

export default RoomJoin;

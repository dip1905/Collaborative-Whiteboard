import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import { SocketProvider } from './components/socket';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoomJoin />} />
          <Route path="/room/:roomId" element={<RoomJoin />} />
          <Route path="/whiteboard/:roomId" element={<Whiteboard />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;

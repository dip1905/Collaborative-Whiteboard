import React, { useEffect, useState } from 'react';
import { useSocket } from './socket';

function ConnectionStatus() {
  const socket = useSocket();
  const [status, setStatus] = useState('connected');

  useEffect(() => {
    if (!socket) return;

    const updateStatus = () => {
      setStatus(socket.connected ? 'connected' : 'disconnected');
    };

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('reconnect_attempt', () => setStatus('reconnecting'));

    updateStatus(); // initial status

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
    };
  }, [socket]);

  const getColor = () => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'red';
      case 'reconnecting': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        border: `2px solid ${getColor()}`,
        color: getColor(),
        fontWeight: 'bold',
        zIndex: 9999,
        fontSize: '12px',
        boxShadow: '0 0 6px rgba(0,0,0,0.1)',
      }}
    >
      {status === 'connected' && '🟢 Connected'}
      {status === 'reconnecting' && '🟠 Reconnecting...'}
      {status === 'disconnected' && '🔴 Disconnected'}
    </div>
  );
}

export default ConnectionStatus;

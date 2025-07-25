import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://192.168.31.35:5000');

    socketRef.current.on('connect', () => {
      setSocketReady(true);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  if (!socketReady) return null;

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

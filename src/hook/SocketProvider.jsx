// SocketProvider.jsx
'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function SocketProvider() {
  useEffect(() => {

    const socket = io(process.env.NEXT_PUBLIC_API_URL);
    window.socket = socket;

    const handleBeforeUnload = () => {
      socket.emit('disconnect', socket);
      socket.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      delete window.socket;
    };
  }, []);



  return (
    <>
      {/* Render notification component when data is available */}
    </>
  );
}
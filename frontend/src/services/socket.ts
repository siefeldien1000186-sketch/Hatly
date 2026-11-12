import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl =
      (import.meta.env.VITE_SOCKET_URL as string) ||
      (import.meta.env.VITE_API_URL
        ? (import.meta.env.VITE_API_URL as string).replace(/\/api\/v1\/?$/, '')
        : null) ||
      (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000');

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Hatly Real-Time Server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from Hatly Real-Time Server');
    });
  }
  return socket;
};

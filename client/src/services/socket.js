import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

/**
 * Socket.IO client singleton.
 * Connects once when the module is first imported.
 */
const socket = io(SERVER_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
});

socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (err) => {
    console.warn('⚠️ Socket connection error:', err.message);
});

export default socket;

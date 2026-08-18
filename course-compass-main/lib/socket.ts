import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socket: Socket | null = null;

/**
 * Lazily creates (or returns) a single authenticated Socket.IO connection for
 * the current user. Call `connectSocket()` after login and `disconnectSocket()`
 * on logout — the same pattern as the axios client's token handling.
 */
export function connectSocket(token: string): Socket {
  if (socket && socket.connected) return socket;

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

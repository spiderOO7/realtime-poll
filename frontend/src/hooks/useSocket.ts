import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

// Keep a single shared socket instance across the app so chat, polls, and
// presence updates use the same connection. This avoids multiple connections
// per tab that can miss events when components unmount/remount.
let sharedSocket: Socket | null = null;

export const useSocket = () => {
  if (!sharedSocket) {
    sharedSocket = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }

  useEffect(() => {
    if (!sharedSocket!.connected) {
      sharedSocket!.connect();
    }
    return () => {
      // Do not disconnect here; other hooks/components share this socket.
    };
  }, []);

  return sharedSocket!;
};
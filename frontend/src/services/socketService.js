import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const socketService = {
  connect: () => {
    if (!socket) {
      socket = io(SOCKET_URL);
    }
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on: (event, callback) => {
    if (socket) socket.on(event, callback);
  },

  off: (event) => {
    if (socket) socket.off(event);
  }
};

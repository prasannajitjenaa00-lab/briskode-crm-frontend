import { io } from 'socket.io-client';
import config from '../config';

const SOCKET_URL = config.api.socketUrl;

let socket = null;

export const connectSocket = (accessToken) => {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    withCredentials: true,
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

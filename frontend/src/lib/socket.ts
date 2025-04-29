import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
  withCredentials: true,
  transports: ['websocket'],
});


export default socket;

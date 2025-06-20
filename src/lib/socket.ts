// src/lib/socket.ts
import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { createServer } from 'http';

let io: Server;

if (typeof window === 'undefined') {
  if (!(global as any).io) {
    const httpServer = createServer();
    (global as any).io = new Server(httpServer, {
      path: '/api/socketio',
    });
    
    httpServer.listen(3001);
    
    io = (global as any).io;
  } else {
    io = (global as any).io;
  }
}

export { io };
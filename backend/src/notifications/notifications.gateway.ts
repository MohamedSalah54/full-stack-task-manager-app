import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*', 
    },
  })
  export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private connectedUsers: Record<string, string> = {}; 
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
      const userId = Object.keys(this.connectedUsers).find(
        key => this.connectedUsers[key] === client.id,
      );
      if (userId) {
        delete this.connectedUsers[userId];
      }
    }
  
    @SubscribeMessage('registerUser')
    handleRegisterUser(client: Socket, userId: string) {
      this.connectedUsers[userId] = client.id;
      console.log(`User ${userId} registered with socket ${client.id}`);
    }
  
    sendNotificationToUser(userId: string, notification: any) {
      const socketId = this.connectedUsers[userId];
      if (socketId) {
        this.server.to(socketId).emit('notification', notification);
      }
    }
  }
  
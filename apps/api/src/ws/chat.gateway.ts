import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'ws', cors: { origin: true, credentials: true }, transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private log = new Logger('Ws');
  private userSockets = new Map<string, Set<string>>();

  constructor(private jwt: JwtService) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token ?? socket.handshake.headers['authorization']?.toString().replace('Bearer ', '');
      const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET });
      const userId = payload.sub;
      socket.data.userId = userId;
      this.add(userId, socket.id);
      socket.join(`user:${userId}`);
      this.log.log(`✓ ${userId} connected (${socket.id})`);
    } catch {
      socket.disconnect();
    }
  }
  handleDisconnect(socket: Socket) { if (socket.data.userId) this.remove(socket.data.userId, socket.id); }

  @SubscribeMessage('chat:join')
  joinChat(@ConnectedSocket() socket: Socket, @MessageBody() data: { chatId: string }) {
    socket.join(`chat:${data.chatId}`);
  }

  @SubscribeMessage('chat:typing')
  typing(@ConnectedSocket() socket: Socket, @MessageBody() data: { chatId: string }) {
    socket.to(`chat:${data.chatId}`).emit('typing', { userId: socket.data.userId, chatId: data.chatId });
  }

  // Server-side emit helpers (called by services)
  emitMessage(chatId: string, message: any) { this.server.to(`chat:${chatId}`).emit('message:new', message); }
  emitMatch(userId: string, match: any)     { this.server.to(`user:${userId}`).emit('match:new', match); }
  emitNotification(userId: string, n: any)  { this.server.to(`user:${userId}`).emit('notification:new', n); }

  private add(uid: string, sid: string) {
    if (!this.userSockets.has(uid)) this.userSockets.set(uid, new Set());
    this.userSockets.get(uid)!.add(sid);
  }
  private remove(uid: string, sid: string) {
    this.userSockets.get(uid)?.delete(sid);
    if (this.userSockets.get(uid)?.size === 0) this.userSockets.delete(uid);
  }
}

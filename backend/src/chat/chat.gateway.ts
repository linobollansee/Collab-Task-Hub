import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { User } from '../users/user.entity';
import { MessageResponseDto } from './dto/message-response.dto';

interface AuthenticatedSocket extends Socket {
  data: {
    user: User;
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private typingUsers = new Map<
    string,
    { projectId: string; userId: string; userName: string }
  >();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);

    // Cleanup typing indicator if user was typing
    const typingInfo = this.typingUsers.get(client.id);
    if (typingInfo) {
      this.server.to(`project:${typingInfo.projectId}`).emit('user-typing', {
        userId: typingInfo.userId,
        userName: typingInfo.userName,
        isTyping: false,
      });
      this.typingUsers.delete(client.id);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-project')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    await client.join(`project:${data.projectId}`);
    console.log(`Client ${client.id} joined project ${data.projectId}`);
    return { event: 'joined-project', data: { projectId: data.projectId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-project')
  async handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    await client.leave(`project:${data.projectId}`);
    console.log(`Client ${client.id} left project ${data.projectId}`);
    return { event: 'left-project', data: { projectId: data.projectId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() sendMessageDto: SendMessageDto,
  ) {
    const user = client.data.user;
    const message = await this.chatService.createMessage(
      sendMessageDto,
      user.id,
    );

    // Broadcast to all users in the project room
    this.server
      .to(`project:${sendMessageDto.projectId}`)
      .emit('new-message', message);

    return { event: 'message-sent', data: message };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string; isTyping: boolean },
  ): void {
    const user = client.data.user;

    if (data.isTyping) {
      this.typingUsers.set(client.id, {
        projectId: data.projectId,
        userId: user.id,
        userName: user.name,
      });
    } else {
      this.typingUsers.delete(client.id);
    }

    client.broadcast.to(`project:${data.projectId}`).emit('user-typing', {
      userId: user.id,
      userName: user.name,
      isTyping: data.isTyping,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('edit-message')
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const user = client.data.user;
    const message = await this.chatService.editMessage(
      data.messageId,
      data.content,
      user.id,
    );

    // Broadcast to all users in the project room
    this.server
      .to(`project:${message.projectId}`)
      .emit('message-edited', message);

    return { event: 'message-edited', data: message };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    const user = client.data.user;
    const message = await this.chatService.deleteMessage(
      data.messageId,
      user.id,
    );

    // Broadcast to all users in the project room
    this.server
      .to(`project:${message.projectId}`)
      .emit('message-deleted', message);

    return { event: 'message-deleted', data: message };
  }

  // Public methods for broadcasting (called from REST API)
  broadcastMessageEdited(message: MessageResponseDto): void {
    this.server
      .to(`project:${message.projectId}`)
      .emit('message-edited', message);
  }

  broadcastMessageDeleted(message: MessageResponseDto): void {
    this.server
      .to(`project:${message.projectId}`)
      .emit('message-deleted', message);
  }
}

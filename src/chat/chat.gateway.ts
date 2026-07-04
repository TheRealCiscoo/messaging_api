import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

import type { ISendingMessage } from './interfaces/sending-message.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export default class ChatwsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // Validating JWT token
    const token = client.handshake.headers.authorization;
    const user = await this.chatService.validateToken(token);
    if (!user) return client.disconnect();

    // Assigning a room
    await this.chatService.assingRoom(user, client);

    this.logger.log(`New client with id ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client with ${client.id} disconnected`);
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: ISendingMessage,
  ) {
    const token = client.handshake.headers.authorization;
    if (!token) {
      client.emit('send-message', 'Unauthorized user: JWT token is missing');
      return client.disconnect();
    }
    return this.chatService.sendMessage(this.server, client, data, token);
  }
}

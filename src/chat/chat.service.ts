import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { HydratedDocument, Model } from 'mongoose';

import { Message } from './entities/message.entity';
import { User } from 'src/auth/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

import { ISendingMessage } from './interfaces/sending-message.interface';

export const ROOM_PREFIX = 'room_';

@Injectable()
export class ChatService {
  private logger = new Logger('ChatService');

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  async validateToken(
    token: string | undefined,
  ): Promise<HydratedDocument<User> | false> {
    if (!token) return false;

    const accessTokenKey =
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
      'default_jwt_access_token_secret';

    const user = await this.authService.verifyToken(token, accessTokenKey);
    if (!user) return false;

    return user;
  }

  async assingRoom(user: HydratedDocument<User>, clientSocket: Socket) {
    const { _id, email } = user;

    const roomName: string = `${ROOM_PREFIX}${_id.toString()}`;

    await clientSocket.join(roomName);

    this.logger.log(
      `Client with email ${email} joined to the room ${roomName}`,
    );
  }

  async sendMessage(
    server: Server,
    client: Socket,
    data: ISendingMessage,
    token: string,
  ) {
    const roomName = `${ROOM_PREFIX}${data.recipientId}`;
    const savedMessage = await this.saveMessage(
      client,
      data.message,
      token,
      data.recipientId,
      roomName,
    );

    server
      .to(`${ROOM_PREFIX}${data.recipientId}`)
      .emit('send-message', savedMessage);

    this.logger.log(`${ROOM_PREFIX}${data.recipientId}`);
  }

  async saveMessage(
    client: Socket,
    message: string,
    token: string,
    recipientId: string,
    roomName: string,
  ) {
    const sender = await this.validateToken(token);
    if (!sender) return client.disconnect();

    const recipient = await this.userModel.findById(recipientId);

    if (!recipient)
      throw new NotFoundException(`User with id ${recipientId} not found`);

    const newMessageData: Message = {
      body: message,
      room: roomName,
      sender: sender._id,
      recipient: recipient._id,
      sentAt: undefined,
      receivedAt: undefined,
    };

    const newMessage = await this.messageModel.create(newMessageData);
    await newMessage.save();
    await newMessage.populate([
      {
        path: 'sender',
        select:
          'firstname lastname email phone phoneCode isVerified state country lang',
      },
      {
        path: 'recipient',
        select: '_id email phone',
      },
    ]);

    return newMessage;
  }
}

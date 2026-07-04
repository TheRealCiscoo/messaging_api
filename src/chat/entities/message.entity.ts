import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from 'src/auth/entities/user.entity';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true, versionKey: false })
export class Message {
  @Prop()
  body!: string;

  @Prop()
  room!: string; // I added this field to specify if the message has been sent from private chat or group chat (feature for future implementation)

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: false,
  })
  sender!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: false,
  })
  recipient!: Types.ObjectId;

  @Prop({
    default: Date.now,
  })
  sentAt?: Date;

  @Prop({
    default: null,
  })
  receivedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

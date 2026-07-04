import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { User } from './user.entity';

@Schema({ timestamps: true })
export class BlacklistedToken {
  @Prop({
    unique: true,
  })
  refresh_token!: string;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  owner!: Types.ObjectId;
}

export const BlacklistedTokenSchema =
  SchemaFactory.createForClass(BlacklistedToken);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret: Record<string, any>) => {
      const { password, __v, ...cleanRet } = ret;
      return cleanRet;
    },
  },
  toObject: {
    transform: (doc, ret: Record<string, any>) => {
      const { password, __v, ...cleatRet } = ret;
      return cleatRet;
    },
  },
})
export class User {
  @Prop({
    minLength: 3,
  })
  firstname!: string;

  @Prop({
    minLength: 3,
  })
  lastname!: string;

  @Prop({
    unique: true,
  })
  email!: string;

  @Prop({
    set: (val: string) => bcrypt.hashSync(val, 10),
    get: (val: string) => val,
    select: false,
  })
  password!: string;

  @Prop({
    unique: true,
  })
  phone!: number;

  @Prop({
    minLength: 1,
  })
  phoneCode!: number;

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({
    default: false,
  })
  isVerified!: boolean;

  @Prop({
    minLength: 3,
  })
  state!: string;

  @Prop({
    minLength: 3,
  })
  country!: string;

  @Prop({
    maxLength: 2,
  })
  lang!: string;

  @Prop({
    default: ['user'],
  })
  roles!: string[];

  @Prop({
    allowNull: true,
  })
  lastLogin!: Date;

  @Prop({
    default: false,
  })
  isLogged!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

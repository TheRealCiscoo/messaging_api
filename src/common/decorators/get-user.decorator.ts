import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: User }>();

    if (!request.user) throw new ForbiddenException();

    const user = request.user;

    if (data) {
      return user[data];
    }

    return user;
  },
);

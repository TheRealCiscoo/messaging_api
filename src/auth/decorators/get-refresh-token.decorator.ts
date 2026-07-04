import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

export const GetRefreshToken = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const refresh_token = request.headers.cookie?.split('refresh_token=')[1];

    if (!refresh_token)
      throw new ForbiddenException('Refresh token is missing');

    return refresh_token;
  },
);

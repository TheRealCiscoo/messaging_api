import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const refresh_token = req.headers.cookie?.split('refresh_token=')[1];

          if (!refresh_token)
            throw new ForbiddenException('Refresh token is missing');

          return refresh_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ||
        'default_jwt_secret',
    });
  }

  async validate(payload: IJwtPayload) {
    const user = await this.userModel.findById(payload.id);

    if (!user) throw new NotFoundException();
    return user;
  }
}

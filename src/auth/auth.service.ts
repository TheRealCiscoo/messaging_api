import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { isEmail, isPositive } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { RegisterNewUserDto } from './dto/register-new-user.dto';
import { User } from './entities/user.entity';
import { SignInUserDto } from './dto/signin-user.dto';
import { IJwtPayload, IPairToken } from './interfaces';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(BlacklistedToken.name)
    private readonly blacklistedTokenModel: Model<BlacklistedToken>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // Register new user logic
  async signup(registerNewUserDto: RegisterNewUserDto) {
    try {
      const newUser = await this.userModel.create(registerNewUserDto);
      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

  // Log in logic
  async signin(signInUserDto: SignInUserDto, response: Response) {
    const { identityValue, password } = signInUserDto;

    const searchFilter = this.buildFilter(identityValue);
    if (!searchFilter) throw new BadRequestException();

    const { pairTokens, data } = await this.logUserIn(searchFilter, password);

    const access_token = this.setRefreshTokenToCookie(response, pairTokens);

    return {
      data,
      access_token: access_token,
    };
  }

  // Log out logic
  async signout(request: Request) {
    const refresh_token = request.headers.cookie?.split('refresh_token=')[1];

    if (!refresh_token) throw new ForbiddenException('Pair token are missing');

    const refresh_secret =
      this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ||
      'default_jwt_refresh_token_secret';
    const owner = (await this.verifyToken(
      refresh_token,
      refresh_secret,
    )) as HydratedDocument<User>;

    await this.addTokenToBlacklist(refresh_token, owner._id);
  }

  private async verifyUser(searchFilter: object, password: string) {
    const user = await this.userModel.findOne(searchFilter).select('+password');

    if (!user) throw new NotFoundException();
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException();

    return user;
  }

  private async logUserIn(searchFilter: object, password: string) {
    const user = await this.verifyUser(searchFilter, password);
    const pairToken = await this.craftJwtPairTokens(user);
    return {
      data: user.toObject(),
      pairTokens: pairToken,
    };
  }

  buildFilter(value: string) {
    if (isEmail(value)) return { email: value };
    if (isPositive(+value)) return { phone: +value };
    return undefined;
  }

  private async craftJwtPairTokens(
    user: HydratedDocument<User>,
  ): Promise<IPairToken> {
    const tokenPayload = { id: user.id };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ||
        'default_jwt_access_token_secret',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ||
        'default_jwt_refresh_token_secret',
      expiresIn: '7d',
    });

    const pairToken: IPairToken = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    return pairToken;
  }

  private setRefreshTokenToCookie(response: Response, pairTokens: IPairToken) {
    const { refresh_token, ...rest_token } = pairTokens;

    const refreshTokenCookieExp = 1000 * 60 * 60 * 24 * 7;

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: !this.configService.get<boolean>('DEBUG_MODE'),
      sameSite: 'lax',
      maxAge: refreshTokenCookieExp,
    });

    return rest_token.access_token;
  }

  async verifyToken(token: string, secret: string) {
    try {
      const { id } = await this.jwtService.verifyAsync<IJwtPayload>(token, {
        secret: secret,
      });
      if (!id) return undefined;
      const user = await this.userModel.findById(id);
      if (!user) return undefined;
      return user;
    } catch {
      return undefined;
    }
  }

  async verifyBlacklistedPairToken(pairTokens: IPairToken) {
    const refresh_token = await this.blacklistedTokenModel.findOne({
      refresh_token: pairTokens.refresh_token,
    });

    if (refresh_token) return true;
    return false;
  }

  private async addTokenToBlacklist(
    refresh_token: string,
    owner_id: Types.ObjectId,
  ) {
    try {
      const bldToken = await this.blacklistedTokenModel.create({
        refresh_token,
        owner: owner_id,
      });
      return await bldToken.save();
    } catch {
      throw new ConflictException('Token have been already blacklisted');
    }
  }

  async refreshAccessToken(response: Response, token: string) {
    const isBlacklisted = await this.verifyBlacklistedPairToken({
      access_token: '',
      refresh_token: token,
    });

    if (isBlacklisted) throw new ForbiddenException('Invalid refresh token');

    const refreshTokenKey =
      this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ||
      'default_jwt_refresh_token_secret';

    const user = await this.verifyToken(token, refreshTokenKey);
    if (!user) throw new ForbiddenException();
    const owner_id = user._id;
    if (!isBlacklisted) await this.addTokenToBlacklist(token, owner_id);

    const pairTokens = await this.craftJwtPairTokens(user);
    const access_token = this.setRefreshTokenToCookie(response, pairTokens);
    return { access_token };
  }
}

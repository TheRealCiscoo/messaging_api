import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  HttpStatus,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import express from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import { RegisterNewUserDto } from './dto/register-new-user.dto';
import { SignInUserDto } from './dto/signin-user.dto';

import { RolesProtected, GetRefreshToken } from './decorators';
import { GetUser } from 'src/common/decorators/get-user.decorator';

import { User } from './entities/user.entity';
import { EROLES } from './interfaces/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  signup(@Body() registerNewUser: RegisterNewUserDto) {
    return this.authService.signup(registerNewUser);
  }

  @Post('signin')
  async signin(
    @Res({ passthrough: true }) res: express.Response,
    @Body() signinUserDto: SignInUserDto,
  ) {
    const responseData = await this.authService.signin(signinUserDto, res);

    return responseData;
  }

  @UseGuards(AuthGuard('refresh-jwt'))
  @Post('refresh')
  async refreshAccessToken(
    @Res() res: express.Response,
    @GetRefreshToken() refreshToken: string,
  ) {
    const responseData = await this.authService.refreshAccessToken(
      res,
      refreshToken,
    );
    res.status(HttpStatus.OK).send(responseData);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Req() req: express.Request) {
    await this.authService.signout(req);
    return;
  }

  @UseGuards(ThrottlerGuard)
  @Get('private')
  @RolesProtected(EROLES.user)
  privateEndpoint(@GetUser() user: User) {
    return user;
  }
}

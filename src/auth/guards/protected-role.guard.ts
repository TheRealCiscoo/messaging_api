import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import express from 'express';
import { EROLES } from '../interfaces/roles.enum';
import { ROLES_KEY } from '../decorators/roles-protected.decorator';
import { User } from '../entities/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class ProtectedRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<EROLES[]>(ROLES_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    const request: express.Request = context.switchToHttp().getRequest();

    const isBlacklisted = await this.verifyPairTokenValidation(request);
    if (isBlacklisted) return false;

    const user: User = request.user as User;

    if (!user.isActive)
      throw new ForbiddenException(
        `Account ${user.email} has been disabled before. Contact an administrator.`,
      );

    const userRoles: EROLES[] = user.roles as EROLES[];
    for (const role of userRoles) if (allowedRoles.includes(role)) return true;

    throw new ForbiddenException(
      `Just users with role(s) [${allowedRoles.toString().split(',').join(', ')}] can access to this resource.`,
    );
  }

  async verifyPairTokenValidation(request: express.Request) {
    const access_token = request.headers.authorization?.split('Bearer ')[1];
    const refresh_token = request.headers.cookie?.split('refresh_token=')[1];
    if (!access_token || !refresh_token || !request.user)
      throw new ForbiddenException();
    const isBlacklisted = await this.authService.verifyBlacklistedPairToken({
      access_token,
      refresh_token,
    });

    return isBlacklisted;
  }
}

import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { EROLES } from '../interfaces/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { ProtectedRoleGuard } from '../guards/protected-role.guard';

export const ROLES_KEY = 'roles';

export const RolesProtected = (...roles: EROLES[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(AuthGuard(), ProtectedRoleGuard),
  );
};

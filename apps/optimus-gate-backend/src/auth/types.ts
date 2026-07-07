import { UserRole } from '../users/user.entity';

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: string[];
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isEmailVerified: boolean;
}

export interface RefreshAuthenticatedUser extends AuthenticatedUser {
  tokenId: string;
  refreshToken: string;
}

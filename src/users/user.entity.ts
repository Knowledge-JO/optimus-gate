export enum UserRole {
  Admin = 'admin',
  Merchant = 'merchant',
  Customer = 'customer',
  Moderator = 'moderator',
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  role: UserRole;
  permissions: string[];
  providers: {
    local?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

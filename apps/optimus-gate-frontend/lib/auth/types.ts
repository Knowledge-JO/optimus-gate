export type AuthUser = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  verificationToken?: string;
};

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  resetToken?: string;
  verificationToken?: string;
};

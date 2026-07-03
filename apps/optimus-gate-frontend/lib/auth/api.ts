import { getAccessToken, getRefreshToken } from "./cookies";
import type { AuthResponse, AuthUser } from "./types";

type BackendError = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  accessToken?: string;
  refreshToken?: string;
};

const backendUrl =
  process.env.OPTIMUS_GATE_BACKEND_URL ??
  process.env.NEXT_PUBLIC_OPTIMUS_GATE_BACKEND_URL ??
  "http://localhost:4000";

export class AuthApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function signup(payload: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  return authRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: compactPayload(payload),
  });
}

export async function forgotPassword(payload: { email: string }) {
  return authRequest<{ message: string; resetToken?: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}) {
  return authRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export async function logout() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return;

  await authRequest<{ message: string }>("/auth/logout", {
    method: "POST",
    refreshToken,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const result = await authRequest<{ user: AuthUser }>("/auth/me", {
      accessToken: token,
    });
    return result.user;
  } catch {
    return null;
  }
}

async function authRequest<T>(path: string, options: RequestOptions = {}) {
  const hasBody = options.body !== undefined;
  const headers = new Headers({
    Accept: "application/json",
  });

  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  if (options.refreshToken) {
    headers.set("Cookie", `refreshToken=${options.refreshToken}`);
  }

  const response = await fetch(`${backendUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new AuthApiError(getErrorMessage(data), response.status);
  }

  return data as T;
}

function getErrorMessage(error: BackendError | null) {
  if (!error) return "Unable to reach the authentication service";
  if (Array.isArray(error.message)) return error.message.join(", ");
  return error.message ?? error.error ?? "Authentication request failed";
}

function compactPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Partial<T>;
}

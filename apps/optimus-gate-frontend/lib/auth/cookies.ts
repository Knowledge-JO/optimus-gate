import { cookies } from "next/headers";
import type { AuthResponse } from "./types";

export const ACCESS_TOKEN_COOKIE = "og_access_token";
export const REFRESH_TOKEN_COOKIE = "og_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

export async function setAuthCookies(auth: AuthResponse) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, auth.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 15 * 60,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, auth.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

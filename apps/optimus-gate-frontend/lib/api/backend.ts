import { getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/auth/cookies";
import type { AuthResponse } from "@/lib/auth/types";

type BackendError = {
  message?: string | string[];
  error?: string;
};

type BackendFailure = {
  ok: false;
  error: {
    message: string;
    status?: number;
  };
};

export type BackendResult<T> =
  | {
      ok: true;
      data: T | null;
    }
  | BackendFailure;

export type BackendMutationResult<T> =
  | {
      ok: true;
      data: T;
    }
  | BackendFailure;

type BackendFetchOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  tags?: string[];
  revalidate?: number;
  noStore?: boolean;
};

export const BACKEND_URL =
  process.env.OPTIMUS_GATE_BACKEND_URL ??
  process.env.NEXT_PUBLIC_OPTIMUS_GATE_BACKEND_URL ??
  "http://localhost:4000";

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<BackendResult<T>> {
  const token = await getValidAccessToken();
  if (!token) {
    return backendError("You need to sign in again", 401);
  }

  return request<T>(path, {
    ...options,
    accessToken: token,
  });
}

export async function backendMutation<T>(
  path: string,
  options: Omit<BackendFetchOptions, "tags" | "revalidate" | "noStore"> = {},
): Promise<BackendMutationResult<T>> {
  const result = await backendFetch<T>(path, {
    ...options,
    noStore: true,
  });

  if (!result.ok) {
    return result;
  }

  if (result.data === null) {
    return backendError("Backend returned no result");
  }

  return {
    ok: true,
    data: result.data,
  };
}

async function getValidAccessToken() {
  const token = await getAccessToken();
  if (token) return token;

  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const auth = await request<AuthResponse>("/auth/refresh", {
      method: "POST",
      refreshToken,
      noStore: true,
    });
    if (!auth.ok || !auth.data) return null;
    await setAuthCookies(auth.data);
    return auth.data.accessToken;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: BackendFetchOptions & {
    accessToken?: string;
    refreshToken?: string;
  } = {},
): Promise<BackendResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  const hasBody = options.body !== undefined;

  if (hasBody) headers.set("Content-Type", "application/json");
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }
  if (options.refreshToken) {
    headers.set("Cookie", `refreshToken=${options.refreshToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      cache: options.noStore ? "no-store" : "force-cache",
      next: options.noStore
        ? undefined
        : {
            revalidate: options.revalidate ?? 30,
            tags: options.tags,
          },
    });
  } catch (error) {
    return backendError(
      error instanceof Error ? error.message : "Unable to reach backend",
    );
  }

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await parseJson(response)
    : null;

  if (!response.ok) {
    return backendError(getErrorMessage(data), response.status);
  }

  return {
    ok: true,
    data: data as T,
  };
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function isBackendError<T>(
  result: BackendResult<T>,
): result is Extract<BackendResult<T>, { ok: false }> {
  return !result.ok;
}

function backendError(message: string, status?: number): BackendFailure {
  return {
    ok: false,
    error: {
      message,
      status,
    },
  };
}

function getErrorMessage(error: BackendError | null) {
  if (!error) return "Backend request failed";
  if (Array.isArray(error.message)) return error.message.join(", ");
  return error.message ?? error.error ?? "Backend request failed";
}

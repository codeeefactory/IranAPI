import { ApiClientError, authApi, type SocialProvider } from "@/lib/api-client";

export type { SocialProvider };
export type AuthError = { code: "invalid" | "network" | "server"; status?: number; detail?: string };

function normalizeAuthError(error: unknown): AuthError {
  if (error instanceof ApiClientError) {
    return {
      code: error.status && [400, 401, 403].includes(error.status) ? "invalid" : "server",
      status: error.status,
      detail: error.message,
    };
  }
  return { code: "network" };
}

export async function loginRequest(username: string, password: string) {
  try {
    return await authApi.login({ username, password });
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function signupRequest(input: {
  username: string;
  email?: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}) {
  try {
    return await authApi.register(input);
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export function startSocialLogin(provider: SocialProvider, next?: string) {
  authApi.startSocialLogin(provider, next);
}

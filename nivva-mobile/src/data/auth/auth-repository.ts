import type { ApiClient } from "@/data/api/api-client";
import { isApiError } from "@/data/api/api-error";
import type { AuthUser } from "@/domain/models";

import type { ApiAuthResponse, ApiUser, LoginInput, RegisterInput } from "./api-auth";

export type AuthSessionResult = {
  accessToken: string;
  user: AuthUser;
};

export type AuthRepository = {
  register(input: RegisterInput): Promise<AuthSessionResult>;
  login(input: LoginInput): Promise<AuthSessionResult>;
  me(): Promise<AuthUser>;
};

export function createAuthRepository(client: ApiClient): AuthRepository {
  return {
    async register(input) {
      const payload = await client.request<ApiAuthResponse>("/api/v1/auth/register", {
        method: "POST",
        body: input,
      });
      return mapAuthResponse(payload);
    },
    async login(input) {
      try {
        const payload = await client.request<ApiAuthResponse>("/api/v1/auth/login", {
          method: "POST",
          body: input,
        });
        return mapAuthResponse(payload);
      } catch (error) {
        throw mapLoginError(error);
      }
    },
    async me() {
      const payload = await client.request<ApiUser>("/api/v1/me");
      return mapUser(payload);
    },
  };
}

function mapAuthResponse(payload: ApiAuthResponse): AuthSessionResult {
  if (!payload.accessToken || !payload.user) {
    throw new Error("Resposta de autenticação inválida.");
  }

  return {
    accessToken: payload.accessToken,
    user: mapUser(payload.user),
  };
}

function mapUser(user: ApiUser): AuthUser {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
  };
}

function mapLoginError(error: unknown): unknown {
  if (isApiError(error) && error.status === 401) {
    error.message = "Email ou senha inválidos.";
  }
  return error;
}

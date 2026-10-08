import { isApiError } from "@/data/api/api-error";
import type { AuthRepository } from "@/data/auth/auth-repository";
import type { AuthSession } from "@/data/auth/auth-session";
import type { TokenStore } from "@/data/auth/token-store";
import type { AuthUser } from "@/domain/models";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "unreachable";

export type AuthSnapshot = {
  status: AuthStatus;
  user: AuthUser | null;
};

export async function restoreAuthSession(input: {
  tokenStore: TokenStore;
  session: AuthSession;
  repository: AuthRepository;
}): Promise<AuthSnapshot> {
  const stored = await input.tokenStore.get();

  if (!stored) {
    input.session.setAccessToken(null);
    return { status: "unauthenticated", user: null };
  }

  input.session.setAccessToken(stored);

  try {
    const user = await input.repository.me();
    return { status: "authenticated", user };
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      input.session.setAccessToken(null);
      await input.tokenStore.clear();
      return { status: "unauthenticated", user: null };
    }

    return { status: "unreachable", user: null };
  }
}

export type AuthSession = {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string | null): void;
  onUnauthorized(listener: () => void): () => void;
  notifyUnauthorized(): void;
};

export function createAuthSession(): AuthSession {
  let accessToken: string | null = null;
  let unauthorizedListener: (() => void) | null = null;

  return {
    async getAccessToken() {
      return accessToken;
    },
    setAccessToken(token) {
      accessToken = token;
    },
    onUnauthorized(listener) {
      unauthorizedListener = listener;
      return () => {
        if (unauthorizedListener === listener) {
          unauthorizedListener = null;
        }
      };
    },
    notifyUnauthorized() {
      unauthorizedListener?.();
    },
  };
}

export const ACCESS_TOKEN_STORAGE_KEY = "nivva.auth.access-token.v1";

export type TokenStore = {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
};

export function createMemoryTokenStore(initial: string | null = null): TokenStore {
  let token = initial;

  return {
    async get() {
      return token;
    },
    async set(next) {
      token = next;
    },
    async clear() {
      token = null;
    },
  };
}

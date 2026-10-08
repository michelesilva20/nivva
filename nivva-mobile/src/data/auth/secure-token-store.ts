import * as SecureStore from "expo-secure-store";

import { ACCESS_TOKEN_STORAGE_KEY, type TokenStore } from "./token-store";

export function createSecureTokenStore(): TokenStore {
  return {
    get() {
      return SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
    },
    set(token) {
      return SecureStore.setItemAsync(ACCESS_TOKEN_STORAGE_KEY, token);
    },
    clear() {
      return SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY);
    },
  };
}

import { apiRequest, type ApiClient } from "@/data/api/api-client";
import type { ApiAccountResponse } from "@/data/api/api-account";
import { mapAccountToApiRequest, mapApiAccountToDomain } from "@/data/api/map-account";
import type { Account, CreateAccountInput } from "@/domain/models";

import type { AccountRepository } from "./account-repository";

const ACCOUNTS_PATH = "/api/v1/accounts";

export function createApiAccountRepository(client: ApiClient = { request: apiRequest }): AccountRepository {
  return {
    canMutate: true,
    async list() {
      const payload = await client.request<ApiAccountResponse[]>(ACCOUNTS_PATH);
      return payload.map(mapApiAccountToDomain);
    },
    async create(input: CreateAccountInput) {
      const payload = await client.request<ApiAccountResponse>(ACCOUNTS_PATH, {
        method: "POST",
        body: mapAccountToApiRequest(input),
      });
      return mapApiAccountToDomain(payload);
    },
    async update(account: Account) {
      const payload = await client.request<ApiAccountResponse>(`${ACCOUNTS_PATH}/${account.id}`, {
        method: "PUT",
        body: mapAccountToApiRequest(account),
      });
      return mapApiAccountToDomain(payload);
    },
    async remove(id: string) {
      await client.request<void>(`${ACCOUNTS_PATH}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

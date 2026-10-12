import { accounts as seedAccounts } from "@/data/mock/accounts";
import type { Account, CreateAccountInput } from "@/domain/models";

import type { AccountRepository } from "./account-repository";

const LOCAL_MUTATION_ERROR = "No modo local as contas de demonstração não podem ser alteradas.";

export function createLocalAccountRepository(): AccountRepository {
  return {
    canMutate: false,
    async list() {
      return seedAccounts.map((account) => ({ ...account, openingBalance: { ...account.openingBalance } }));
    },
    async create(_input: CreateAccountInput): Promise<Account> {
      throw new Error(LOCAL_MUTATION_ERROR);
    },
    async update(_account: Account): Promise<Account> {
      throw new Error(LOCAL_MUTATION_ERROR);
    },
    async remove(_id: string): Promise<void> {
      throw new Error(LOCAL_MUTATION_ERROR);
    },
  };
}

export const localAccountRepository = createLocalAccountRepository();

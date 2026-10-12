import type { Account, CreateAccountInput } from "@/domain/models";

export type AccountRepository = {
  readonly canMutate: boolean;
  list(): Promise<Account[]>;
  create(input: CreateAccountInput): Promise<Account>;
  update(account: Account): Promise<Account>;
  remove(id: string): Promise<void>;
};

import type { Account } from "./account";
import type { Transaction } from "./transaction";

export type WalletSegment = "accounts" | "cards" | "investments";

export type WalletSnapshot = {
  accounts: Account[];
  transactions: Transaction[];
  historyLabel: string;
};

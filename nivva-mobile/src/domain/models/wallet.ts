import type { AccountView } from "./account";
import type { Transaction } from "./transaction";

export type WalletSegment = "accounts" | "cards" | "investments";

export type WalletSnapshot = {
  accounts: AccountView[];
  transactions: Transaction[];
  historyLabel: string;
};

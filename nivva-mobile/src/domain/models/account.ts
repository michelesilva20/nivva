import type { Money } from "./money";

export type AccountType = "checking" | "savings" | "digital" | "cash" | "other";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  digital: "Conta digital",
  cash: "Dinheiro",
  other: "Outra",
};

export const ACCOUNT_TYPES = Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[];

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: Money;
};

export type AccountView = Account & {
  balance: Money;
  typeLabel: string;
};

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  openingBalance: Money;
};

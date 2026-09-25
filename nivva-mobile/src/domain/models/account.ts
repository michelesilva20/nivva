import type { Money } from "./money";

export type Account = {
  id: string;
  name: string;
  typeLabel: string;
  balance: Money;
  maskedNumber: string;
};

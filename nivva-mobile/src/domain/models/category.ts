import type { Money } from "./money";

export type CategoryKind =
  | "home"
  | "food"
  | "transport"
  | "leisure"
  | "subscription"
  | "other"
  | "income";

export type Category = {
  id: string;
  name: string;
  kind: CategoryKind;
  icon: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  amount: Money;
  percentage: number;
  kind: CategoryKind;
  icon: string;
};

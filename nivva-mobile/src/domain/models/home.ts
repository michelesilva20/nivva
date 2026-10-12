import type { FinancialInsight } from "./insight";
import type { Metric } from "./metric";
import type { Money } from "./money";
import type { Transaction } from "./transaction";

export type HomeSnapshot = {
  balance: Money;
  balanceVariationLabel: string | null;
  metrics: Metric[];
  insight: FinancialInsight;
  transactions: Transaction[];
};

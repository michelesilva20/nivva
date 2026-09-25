import type { Money } from "./money";

export type MetricKind = "income" | "expense" | "available";

export type Metric = {
  label: string;
  amount: Money;
  kind: MetricKind;
};

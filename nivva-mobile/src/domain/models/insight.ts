export type FinancialInsightKind = "demo" | "empty";

export type FinancialInsight = {
  kind: FinancialInsightKind;
  message: string;
};

import { money, type MonthlyBudget } from "@/domain/models";

export type StoredBudgetsDataV1 = {
  version: 1;
  budgets: MonthlyBudget[];
};

export type BudgetStore = {
  budgets: MonthlyBudget[];
};

export type BudgetParseStatus = "missing" | "ok" | "error";

export type BudgetParseResult = {
  status: BudgetParseStatus;
  budgets: MonthlyBudget[];
};

const PERIOD_PATTERN = /^\d{4}-\d{2}$/;

export function serializeBudgets(store: BudgetStore): string {
  const payload: StoredBudgetsDataV1 = {
    version: 1,
    budgets: store.budgets,
  };

  return JSON.stringify(payload);
}

export function parseBudgets(raw: string | null): BudgetParseResult {
  if (raw == null || raw.trim() === "") {
    return { status: "missing", budgets: [] };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isStoredBudgetsDataV1(parsed)) {
      console.warn("[nivva] storage de orçamento inválido");
      return { status: "error", budgets: [] };
    }

    const budgets: MonthlyBudget[] = [];
    for (const item of parsed.budgets) {
      const normalized = normalizeBudget(item);
      if (!normalized) {
        console.warn("[nivva] registro de orçamento inválido");
        return { status: "error", budgets: [] };
      }
      budgets.push(normalized);
    }

    return { status: "ok", budgets: dedupeByPeriod(budgets) };
  } catch (error) {
    console.warn("[nivva] JSON de orçamento inválido", error);
    return { status: "error", budgets: [] };
  }
}

function isStoredBudgetsDataV1(value: unknown): value is { version: 1; budgets: unknown[] } {
  return isRecord(value) && value.version === 1 && Array.isArray(value.budgets);
}

function normalizeBudget(value: unknown): MonthlyBudget | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || value.id.length === 0) {
    return null;
  }

  if (typeof value.period !== "string" || !PERIOD_PATTERN.test(value.period)) {
    return null;
  }

  const month = Number(value.period.slice(5));
  if (month < 1 || month > 12) {
    return null;
  }

  if (typeof value.createdAt !== "string" || typeof value.updatedAt !== "string") {
    return null;
  }

  if (!isRecord(value.limit) || typeof value.limit.cents !== "number") {
    return null;
  }

  const cents = value.limit.cents;
  if (!Number.isInteger(cents) || cents <= 0) {
    return null;
  }

  return {
    id: value.id,
    period: value.period,
    limit: money(cents),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function dedupeByPeriod(budgets: MonthlyBudget[]): MonthlyBudget[] {
  const latest = new Map<string, MonthlyBudget>();

  for (const budget of budgets) {
    const current = latest.get(budget.period);
    if (!current || Date.parse(budget.updatedAt) >= Date.parse(current.updatedAt)) {
      latest.set(budget.period, budget);
    }
  }

  return [...latest.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

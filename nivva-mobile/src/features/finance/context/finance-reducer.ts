import { money, type Account, type NewExpenseInput, type Transaction } from "@/domain/models";

export type FinanceState = {
  transactions: Transaction[];
  accounts: Account[];
  notice: string | null;
};

export type FinanceAction =
  | { type: "add-expense"; input: NewExpenseInput }
  | { type: "clear-notice" };

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  if (action.type === "clear-notice") {
    return { ...state, notice: null };
  }

  const expense: Transaction = {
    id: `expense-${Date.now()}`,
    title: action.input.title.trim(),
    categoryId: action.input.categoryId,
    accountId: action.input.accountId,
    amount: money(-Math.abs(action.input.amountInCents)),
    occurredAt: action.input.occurredAt,
    type: "expense",
    note: action.input.note?.trim() || undefined,
  };

  return {
    notice: "Gasto adicionado",
    transactions: [expense, ...state.transactions],
    accounts: state.accounts.map((account) =>
      account.id === expense.accountId
        ? { ...account, balance: money(account.balance.cents - Math.abs(expense.amount.cents)) }
        : account,
    ),
  };
}

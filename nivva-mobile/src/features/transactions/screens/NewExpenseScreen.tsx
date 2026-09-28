import { useFinance } from "@/features/finance";

import { TransactionForm } from "../components/TransactionForm";

export function NewExpenseScreen() {
  const { addExpense } = useFinance();

  return <TransactionForm kind="expense" onSubmit={addExpense} />;
}

import { useFinance } from "@/features/finance";

import { TransactionForm } from "../components/TransactionForm";

export function NewIncomeScreen() {
  const { addIncome } = useFinance();

  return (
    <TransactionForm
      kind="income"
      onSubmit={(values) => {
        addIncome({
          title: values.title,
          amountInCents: values.amountInCents,
          accountId: values.accountId,
          occurredAt: values.occurredAt,
          note: values.note,
        });
      }}
    />
  );
}

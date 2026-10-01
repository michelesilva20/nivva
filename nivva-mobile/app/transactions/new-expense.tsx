import { FinanceLoadGate } from "@/features/finance";
import { NewExpenseScreen } from "@/features/transactions";

export default function NewExpenseRoute() {
  return (
    <FinanceLoadGate>
      <NewExpenseScreen />
    </FinanceLoadGate>
  );
}

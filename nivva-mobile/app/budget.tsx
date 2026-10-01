import { BudgetScreen } from "@/features/budget";
import { FinanceLoadGate } from "@/features/finance";

export default function BudgetRoute() {
  return (
    <FinanceLoadGate>
      <BudgetScreen />
    </FinanceLoadGate>
  );
}

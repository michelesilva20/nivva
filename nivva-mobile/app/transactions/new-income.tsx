import { FinanceLoadGate } from "@/features/finance";
import { NewIncomeScreen } from "@/features/transactions";

export default function NewIncomeRoute() {
  return (
    <FinanceLoadGate>
      <NewIncomeScreen />
    </FinanceLoadGate>
  );
}

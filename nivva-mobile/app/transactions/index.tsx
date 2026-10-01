import { FinanceLoadGate } from "@/features/finance";
import { TransactionsScreen } from "@/features/transactions";

export default function TransactionsRoute() {
  return (
    <FinanceLoadGate>
      <TransactionsScreen />
    </FinanceLoadGate>
  );
}

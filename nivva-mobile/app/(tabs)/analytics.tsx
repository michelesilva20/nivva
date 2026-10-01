import { AnalyticsScreen } from "@/features/analytics";
import { FinanceLoadGate } from "@/features/finance";

export default function AnalyticsRoute() {
  return (
    <FinanceLoadGate>
      <AnalyticsScreen />
    </FinanceLoadGate>
  );
}

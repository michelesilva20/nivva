import { useLocalSearchParams } from "expo-router";

import { FinanceLoadGate } from "@/features/finance";
import { EditTransactionScreen } from "@/features/transactions";

export default function EditTransactionRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <FinanceLoadGate>
      <EditTransactionScreen id={id ?? ""} />
    </FinanceLoadGate>
  );
}

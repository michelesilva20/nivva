import { useLocalSearchParams } from "expo-router";

import { TransactionDetailsScreen } from "@/features/transactions";

export default function TransactionDetailsRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <TransactionDetailsScreen id={id ?? ""} />;
}

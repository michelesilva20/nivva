import { useLocalSearchParams } from "expo-router";

import { EditTransactionScreen } from "@/features/transactions";

export default function EditTransactionRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <EditTransactionScreen id={id ?? ""} />;
}

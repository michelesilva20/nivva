import { useLocalSearchParams } from "expo-router";

import { EditAccountScreen } from "@/features/accounts";

export default function EditAccountRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditAccountScreen id={id ?? ""} />;
}

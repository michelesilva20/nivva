import { useLocalSearchParams } from "expo-router";

import { EditGoalScreen } from "@/features/goals";

export default function EditGoalRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <EditGoalScreen id={id ?? ""} />;
}

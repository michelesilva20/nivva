import { useLocalSearchParams } from "expo-router";

import { GoalDetailsScreen } from "@/features/goals";

export default function GoalDetailsRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <GoalDetailsScreen id={id ?? ""} />;
}

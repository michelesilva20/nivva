import { useLocalSearchParams } from "expo-router";

import { ContributeGoalScreen } from "@/features/goals";

export default function ContributeGoalRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <ContributeGoalScreen id={id ?? ""} />;
}

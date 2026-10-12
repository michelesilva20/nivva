import AsyncStorage from "@react-native-async-storage/async-storage";

import { createLocalGoalRepository } from "./local-goal-repository";
import { createGoalStore } from "./goal-repository";

/**
 * Persistência local do domínio de metas.
 * No modo API o GoalProvider usa ApiGoalRepository e ignora este storage.
 */
export const localGoalRepository = createLocalGoalRepository(AsyncStorage);

export function clearLocalGoalsData() {
  return createGoalStore(AsyncStorage).clear();
}

if (__DEV__) {
  (globalThis as { clearLocalGoalsData?: typeof clearLocalGoalsData }).clearLocalGoalsData = async () => {
    await clearLocalGoalsData();
    console.log("[nivva] metas locais limpas. Recarregue o app.");
  };
}

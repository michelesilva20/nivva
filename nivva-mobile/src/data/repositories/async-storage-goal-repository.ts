import AsyncStorage from "@react-native-async-storage/async-storage";

import { createGoalRepository } from "./goal-repository";

/**
 * Persistência local temporária do domínio de metas.
 * Não mistura com transações. No futuro, o GoalProvider
 * troca este repositório por REST / Spring Boot / PostgreSQL.
 */
export const localGoalRepository = createGoalRepository(AsyncStorage);

export function clearLocalGoalsData() {
  return localGoalRepository.clear();
}

if (__DEV__) {
  (globalThis as { clearLocalGoalsData?: typeof clearLocalGoalsData }).clearLocalGoalsData = async () => {
    await clearLocalGoalsData();
    console.log("[nivva] metas locais limpas. Recarregue o app.");
  };
}

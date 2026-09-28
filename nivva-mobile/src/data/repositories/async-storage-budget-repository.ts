import AsyncStorage from "@react-native-async-storage/async-storage";

import { createBudgetRepository } from "./budget-repository";

/**
 * Persistência local temporária do domínio de orçamento.
 * Não mistura com transações nem metas. No futuro, o BudgetProvider
 * troca este repositório por REST / Spring Boot / PostgreSQL.
 */
export const localBudgetRepository = createBudgetRepository(AsyncStorage);

export function clearLocalBudgetsData() {
  return localBudgetRepository.clear();
}

if (__DEV__) {
  (globalThis as { clearLocalBudgetsData?: typeof clearLocalBudgetsData }).clearLocalBudgetsData = async () => {
    await clearLocalBudgetsData();
    console.log("[nivva] orçamentos locais limpos. Recarregue o app.");
  };
}

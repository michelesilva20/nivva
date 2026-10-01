import AsyncStorage from "@react-native-async-storage/async-storage";

import { createTransactionRepository } from "./transaction-repository";

/**
 * Adapter local. Em modo API este arquivo não é lido nem escrito.
 */
export const localTransactionRepository = createTransactionRepository(AsyncStorage);

/** Desenvolvimento: apaga só as transações criadas no aparelho. Não é "apagar conta". */
export function clearLocalFinanceData() {
  return localTransactionRepository.clear();
}

if (__DEV__) {
  (globalThis as { clearLocalFinanceData?: typeof clearLocalFinanceData }).clearLocalFinanceData =
    async () => {
      await clearLocalFinanceData();
      console.log("[nivva] transações locais limpas. Recarregue o app.");
    };
}

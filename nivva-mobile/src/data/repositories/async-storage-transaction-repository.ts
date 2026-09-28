import AsyncStorage from "@react-native-async-storage/async-storage";

import { createTransactionRepository } from "./transaction-repository";

/**
 * Persistência local temporária da fase offline/protótipo.
 * Não é o banco final. Quando a API existir, o FinanceProvider
 * troca este repositório por uma implementação REST.
 */
export const localTransactionRepository = createTransactionRepository(AsyncStorage);

/** Desenvolvimento: apaga só as transações criadas no aparelho. Não é "apagar conta". */
export function clearLocalFinanceData() {
  return localTransactionRepository.clearUserTransactions();
}

if (__DEV__) {
  (globalThis as { clearLocalFinanceData?: typeof clearLocalFinanceData }).clearLocalFinanceData =
    async () => {
      await clearLocalFinanceData();
      console.log("[nivva] transações locais limpas. Recarregue o app.");
    };
}

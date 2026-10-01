import { accounts } from "../mock/accounts";
import { categories } from "../mock/categories";
import { DEFAULT_MONTHLY_BUDGET_CENTS } from "../mock/budget";
import { transactions } from "../mock/transactions";

/**
 * Semente de demonstração, só no mobile e somente leitura.
 * Transações do usuário passam pelo TransactionRepository
 * (AsyncStorage ou API), sem misturar com esta semente.
 */
export const nivvaRepository = {
  getSeed() {
    return {
      accounts,
      categories,
      transactions,
      budgetTotalCents: DEFAULT_MONTHLY_BUDGET_CENTS,
      referenceDate: new Date().toISOString(),
    };
  },
};

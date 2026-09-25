import { accounts } from "../mock/accounts";
import { categories } from "../mock/categories";
import { MONTHLY_BUDGET_CENTS, transactions } from "../mock/transactions";

/**
 * Semente local. A UI lê o estado vivo em FinanceProvider.
 * Quando a API existir, esta camada passa a buscar remoto.
 */
export const nivvaRepository = {
  getSeed() {
    return {
      accounts,
      categories,
      transactions,
      budgetTotalCents: MONTHLY_BUDGET_CENTS,
      referenceDate: new Date().toISOString(),
    };
  },
};

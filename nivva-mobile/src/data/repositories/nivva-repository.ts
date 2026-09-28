import { accounts } from "../mock/accounts";
import { categories } from "../mock/categories";
import { DEFAULT_MONTHLY_BUDGET_CENTS } from "../mock/budget";
import { transactions } from "../mock/transactions";

/**
 * Semente de demonstração. Transações criadas no aparelho passam
 * pelo TransactionRepository. Quando a API existir, essa camada
 * substitui o AsyncStorage; esta semente deixa de ser necessária.
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

import { createApiGoalRepository } from "./api-goal-repository";
import { getTransactionSource, type TransactionSource } from "./active-transaction-repository";
import type { GoalRepository } from "./goal-repository";
import { localGoalRepository } from "./async-storage-goal-repository";

export function createActiveGoalRepository(
  source: TransactionSource = getTransactionSource(),
): GoalRepository {
  if (source === "api") {
    return createApiGoalRepository();
  }

  return localGoalRepository;
}

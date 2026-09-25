import type { Transaction } from "@/domain/models";

import { formatShortDate, formatTime } from "./format";

export function formatTransactionSupport(transaction: Transaction, categoryName: string): string {
  return `${categoryName} • ${formatShortDate(transaction.occurredAt)}, ${formatTime(transaction.occurredAt)}`;
}

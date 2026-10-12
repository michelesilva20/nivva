import { money, type Account, type AccountType, type CreateAccountInput } from "@/domain/models";

import type { ApiAccountResponse, ApiAccountType, ApiAccountWriteRequest } from "./api-account";

const API_TO_DOMAIN: Record<ApiAccountType, AccountType> = {
  CHECKING: "checking",
  SAVINGS: "savings",
  DIGITAL: "digital",
  CASH: "cash",
  OTHER: "other",
};

const DOMAIN_TO_API: Record<AccountType, ApiAccountType> = {
  checking: "CHECKING",
  savings: "SAVINGS",
  digital: "DIGITAL",
  cash: "CASH",
  other: "OTHER",
};

export function mapApiAccountToDomain(response: ApiAccountResponse): Account {
  return {
    id: response.id,
    name: response.name,
    type: API_TO_DOMAIN[response.type],
    openingBalance: money(response.openingBalanceCents),
  };
}

export function mapAccountToApiRequest(account: Account | CreateAccountInput): ApiAccountWriteRequest {
  return {
    name: account.name,
    type: DOMAIN_TO_API[account.type],
    openingBalanceCents: account.openingBalance.cents,
  };
}

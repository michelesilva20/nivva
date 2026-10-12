export type ApiAccountType = "CHECKING" | "SAVINGS" | "DIGITAL" | "CASH" | "OTHER";

export type ApiAccountResponse = {
  id: string;
  name: string;
  type: ApiAccountType;
  openingBalanceCents: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiAccountWriteRequest = {
  name: string;
  type: ApiAccountType;
  openingBalanceCents: number;
};

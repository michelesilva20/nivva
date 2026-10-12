import { money, type Account } from "@/domain/models";

/**
 * Saldos-base da semente. Já incluem as transações iniciais.
 * O saldo efetivo é openingBalance + soma(amount das transações locais do usuário).
 */
export const accounts: Account[] = [
  {
    id: "main",
    name: "Conta principal",
    type: "checking",
    openingBalance: money(862_050),
  },
  {
    id: "reserve",
    name: "Reserva",
    type: "digital",
    openingBalance: money(383_030),
  },
];

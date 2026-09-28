import { money, type Account } from "@/domain/models";

/**
 * Saldos-base da semente. Já incluem as transações iniciais.
 * O saldo efetivo é saldo-base + soma(amount das transações locais do usuário).
 */
export const accounts: Account[] = [
  {
    id: "main",
    name: "Conta principal",
    typeLabel: "Conta corrente",
    balance: money(862_050),
    maskedNumber: "•••• 1234",
  },
  {
    id: "reserve",
    name: "Reserva",
    typeLabel: "Conta digital",
    balance: money(383_030),
    maskedNumber: "•••• 7082",
  },
];

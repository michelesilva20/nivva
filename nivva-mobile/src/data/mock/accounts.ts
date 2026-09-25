import { money, type Account } from "@/domain/models";

/**
 * Saldos já incluem o efeito das transações iniciais.
 * Só mudam quando o usuário cria um gasto novo na sessão.
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

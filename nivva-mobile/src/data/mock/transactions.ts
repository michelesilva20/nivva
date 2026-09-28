import { money, type Transaction } from "@/domain/models";

import { DEFAULT_MONTHLY_BUDGET_CENTS } from "./budget";

/**
 * O cenário de demonstração acompanha o mês atual.
 * As despesas deste mês somam R$ 4.320,00. Meses anteriores existem só para o gráfico.
 */
export const MONTHLY_BUDGET_CENTS = DEFAULT_MONTHLY_BUDGET_CENTS;

function atCurrentMonth(day: number, hours: number, minutes: number): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return new Date(now.getFullYear(), now.getMonth(), Math.min(day, lastDay), hours, minutes).toISOString();
}

function atMonthsAgo(monthsAgo: number): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, 15, 12, 0).toISOString();
}

function monthTitle(monthsAgo: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
  return `Gastos de ${month}`;
}

export const transactions: Transaction[] = [
  {
    id: "salary",
    title: "Salário",
    categoryId: "income",
    accountId: "main",
    amount: money(485_000),
    occurredAt: atCurrentMonth(1, 9, 0),
    type: "income",
  },
  {
    id: "freelance",
    title: "Freelance",
    categoryId: "income",
    accountId: "main",
    amount: money(338_000),
    occurredAt: atCurrentMonth(5, 10, 30),
    type: "income",
  },
  {
    id: "market",
    title: "Mercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-12_990),
    occurredAt: atCurrentMonth(12, 14, 21),
    type: "expense",
  },
  {
    id: "groceries",
    title: "Supermercado",
    categoryId: "food",
    accountId: "main",
    amount: money(-82_010),
    occurredAt: atCurrentMonth(8, 18, 40),
    type: "expense",
  },
  {
    id: "transport",
    title: "Transporte",
    categoryId: "transport",
    accountId: "main",
    amount: money(-2_480),
    occurredAt: atCurrentMonth(11, 8, 17),
    type: "expense",
  },
  {
    id: "fuel",
    title: "Combustível",
    categoryId: "transport",
    accountId: "main",
    amount: money(-58_020),
    occurredAt: atCurrentMonth(4, 19, 5),
    type: "expense",
  },
  {
    id: "subscription",
    title: "Assinatura",
    categoryId: "subscription",
    accountId: "main",
    amount: money(-4_990),
    occurredAt: atCurrentMonth(12, 7, 56),
    type: "expense",
  },
  {
    id: "streaming",
    title: "Streaming",
    categoryId: "subscription",
    accountId: "main",
    amount: money(-90_110),
    occurredAt: atCurrentMonth(3, 11, 12),
    type: "expense",
  },
  {
    id: "home",
    title: "Moradia",
    categoryId: "home",
    accountId: "main",
    amount: money(-43_200),
    occurredAt: atCurrentMonth(11, 20, 12),
    type: "expense",
  },
  {
    id: "rent",
    title: "Aluguel",
    categoryId: "home",
    accountId: "main",
    amount: money(-95_000),
    occurredAt: atCurrentMonth(2, 8, 0),
    type: "expense",
  },
  {
    id: "cinema",
    title: "Cinema",
    categoryId: "leisure",
    accountId: "main",
    amount: money(-43_200),
    occurredAt: atCurrentMonth(7, 21, 30),
    type: "expense",
  },
  {
    id: "hist-5",
    title: monthTitle(5),
    categoryId: "other",
    accountId: "main",
    amount: money(-225_000),
    occurredAt: atMonthsAgo(5),
    type: "expense",
  },
  {
    id: "hist-4",
    title: monthTitle(4),
    categoryId: "other",
    accountId: "main",
    amount: money(-337_000),
    occurredAt: atMonthsAgo(4),
    type: "expense",
  },
  {
    id: "hist-3",
    title: monthTitle(3),
    categoryId: "other",
    accountId: "main",
    amount: money(-294_000),
    occurredAt: atMonthsAgo(3),
    type: "expense",
  },
  {
    id: "hist-2",
    title: monthTitle(2),
    categoryId: "other",
    accountId: "main",
    amount: money(-277_000),
    occurredAt: atMonthsAgo(2),
    type: "expense",
  },
  {
    id: "hist-1",
    title: monthTitle(1),
    categoryId: "other",
    accountId: "main",
    amount: money(-398_500),
    occurredAt: atMonthsAgo(1),
    type: "expense",
  },
];

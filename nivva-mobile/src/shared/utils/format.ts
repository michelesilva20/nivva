import type { Money } from "@/domain/models";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentageFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: Money, showSign = false): string {
  const formatted = currencyFormatter.format(Math.abs(amount.cents) / 100).replaceAll("\u00A0", " ");

  if (showSign && amount.cents > 0) {
    return `+ ${formatted}`;
  }

  if (amount.cents < 0) {
    return `- ${formatted}`;
  }

  return formatted;
}

/** `ratio` vai de 0 a 1. */
export function formatPercentage(ratio: number): string {
  return percentageFormatter.format(ratio);
}

export function isSameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function formatShortDate(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const day = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "");

  return `${day} ${month}`;
}

export function formatExpenseDate(date: Date, today = new Date()): string {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  const label = `${day} de ${month}`;

  return isSameCalendarDay(date, today) ? `Hoje, ${label}` : label;
}

export function formatTime(isoDateTime: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDateTime));
}

/**
 * Valor em centavos inteiros.
 * A interface apenas exibe. Cálculos financeiros críticos ficarão no backend.
 */
export type Money = {
  readonly cents: number;
};

export function money(cents: number): Money {
  return { cents };
}

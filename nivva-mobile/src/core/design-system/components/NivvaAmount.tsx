import type { Money } from "@/domain/models";
import { formatCurrency } from "@/shared/utils/format";

import type { TypographyVariant } from "../theme/typography";
import { NivvaText } from "./NivvaText";

type AmountSize = "large" | "medium" | "small";

const variants: Record<AmountSize, TypographyVariant> = {
  large: "moneyLarge",
  medium: "moneyMedium",
  small: "moneySmall",
};

type NivvaAmountProps = {
  amount: Money;
  size?: AmountSize;
  tone?: "primary" | "inverse" | "income" | "onHero";
  showSign?: boolean;
};

export function NivvaAmount({
  amount,
  size = "medium",
  tone = "primary",
  showSign = false,
}: NivvaAmountProps) {
  return (
    <NivvaText
      variant={variants[size]}
      tone={tone}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.7}
    >
      {formatCurrency(amount, showSign)}
    </NivvaText>
  );
}
